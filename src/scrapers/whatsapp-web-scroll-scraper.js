import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { savePhoneNumbers } from '../utils/fileHandler.js';
import { normalizePhoneNumber, deduplicatePhoneNumbers } from '../utils/phoneUtils.js';
import { logRealtime, initLogFile, flushExcelCache } from '../utils/realtimeLogger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = process.env.OUTPUT_FILE || 'output/whatsapp-scroll-numbers.json';
const GROUP_NAME = process.env.GROUP_NAME || '';

/**
 * WhatsApp Web Scroll-Based Phone Number Scraper
 * Monitors the group members list and extracts phone numbers as you scroll
 */
async function scrapePhoneNumbers() {
  console.log('🚀 Starting WhatsApp Web Scroll Scraper...\n');
  console.log('📱 This tool will monitor WhatsApp Web and extract phone numbers as you scroll\n');
  console.log('⚠️  Make sure WhatsApp Web is open and you are viewing the group members list\n');
  console.log('Press Ctrl+C to stop and save extracted numbers\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to WhatsApp Web
    console.log('🌐 Opening WhatsApp Web...\n');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });

    console.log('⏳ Waiting for you to log in and open the group members list...\n');
    console.log('📋 Instructions:');
    console.log('   1. Scan QR code if needed');
    console.log('   2. Open the group you want to scrape');
    console.log('   3. Click on group name to open Group Info');
    console.log('   4. Start scrolling through the members list\n');
    console.log('🔄 Monitoring for phone numbers...\n');
    
    // Initialize real-time log file
    await initLogFile();
    console.log('📝 Real-time logging enabled - numbers saved as you scroll\n');

    // Wait for WhatsApp Web to load
    await page.waitForSelector('[data-testid="chatlist"]', { timeout: 120000 }).catch(() => {
      console.log('⚠️  WhatsApp Web loaded (or already logged in)\n');
    });

    // Set up phone number extraction (Map: number -> phoneData)
    const extractedNumbers = new Map();
    let lastCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 1000; // Prevent infinite scrolling

    // Function to extract phone numbers from the page (Ghana numbers only)
    const extractNumbers = async () => {
      try {
        const phoneNumbers = await page.evaluate(() => {
          const numbers = [];
          const seenNumbers = new Set();
          
          // Ghana phone number regex patterns
          // Format: +233XXXXXXXXX or 233XXXXXXXXX (12 digits) or 0XXXXXXXXX (10 digits)
          // Mobile prefixes: 20, 24, 26, 27, 50, 54, 55, 56, 57, 59
          // Pattern matches: +23320/24/26/27/50/54/55/56/57/59 followed by 7 digits
          const ghanaPhoneRegex = /(\+?233(?:20|24|26|27|50|54|55|56|57|59)|0?(?:20|24|26|27|50|54|55|56|57|59))\d{7}\b/g;
          
          // Better selectors for WhatsApp member list
          const selectors = [
            '[data-testid="cell-frame-container"]', // Member list items
            '[role="listitem"]', // List items
            'div[data-testid="cell-frame-container"] span[title]', // Member names with titles
            'div[data-testid="drawer-right"] [role="listitem"]', // Right drawer members
          ];

          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                // Get text content and title
                const text = el.textContent || el.innerText || '';
                const title = el.getAttribute('title') || '';
                const combinedText = `${text} ${title}`;
                
                // Extract Ghana phone numbers
                const matches = combinedText.match(ghanaPhoneRegex);
                
                if (matches) {
                  matches.forEach(match => {
                    // Clean the number
                    let cleaned = match.replace(/\D/g, '');
                    
                    // Normalize to Ghana format (233XXXXXXXXX)
                    if (cleaned.startsWith('233')) {
                      if (cleaned.length === 12) {
                        cleaned = cleaned;
                      } else if (cleaned.length > 12) {
                        cleaned = cleaned.substring(0, 12);
                      } else {
                        return; // Invalid length
                      }
                    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
                      // Convert 0XXXXXXXXX to 233XXXXXXXXX
                      cleaned = '233' + cleaned.substring(1);
                    } else if (cleaned.length === 9) {
                      // 9 digits, add 233
                      cleaned = '233' + cleaned;
                    } else {
                      return; // Not a valid Ghana number format
                    }
                    
                    // Validate Ghana mobile prefix (20, 24, 26, 27, 50, 54, 55, 56, 57, 59)
                    const prefix = cleaned.substring(3, 5);
                    const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
                    if (!validPrefixes.includes(prefix)) {
                      return; // Not a valid Ghana mobile prefix
                    }
                    
                    // Skip if already seen
                    if (seenNumbers.has(cleaned)) {
                      return;
                    }
                    seenNumbers.add(cleaned);
                    
                    // Extract name - look for text that's not a phone number
                    let name = 'Unknown';
                    
                    // Try multiple strategies to find the name
                    // Strategy 1: Look for span with title attribute (WhatsApp member names)
                    let nameElement = el.querySelector('span[title]');
                    if (nameElement) {
                      name = nameElement.getAttribute('title') || nameElement.textContent || '';
                    }
                    
                    // Strategy 2: Look for span with dir="auto" (WhatsApp text direction)
                    if (!nameElement || name === 'Unknown' || name.length === 0) {
                      nameElement = el.querySelector('span[dir="auto"]');
                      if (nameElement) {
                        name = nameElement.textContent || nameElement.getAttribute('title') || '';
                      }
                    }
                    
                    // Strategy 3: Look in parent container
                    if (!nameElement || name === 'Unknown' || name.length === 0) {
                      const parent = el.closest('[data-testid="cell-frame-container"]');
                      if (parent) {
                        nameElement = parent.querySelector('span[title]') || parent.querySelector('span[dir="auto"]');
                        if (nameElement) {
                          name = nameElement.getAttribute('title') || nameElement.textContent || '';
                        }
                      }
                    }
                    
                    // Strategy 4: Use text content but filter out phone numbers
                    if (!name || name === 'Unknown' || name.length === 0) {
                      const allText = el.textContent || el.innerText || '';
                      // Split by newlines and find text that doesn't look like a phone number
                      const textParts = allText.split(/\n/).map(t => t.trim()).filter(t => t.length > 0);
                      const phoneTestRegex = /(\+?233(?:20|24|26|27|50|54|55|56|57|59)|0?(?:20|24|26|27|50|54|55|56|57|59))\d{7}\b/;
                      for (const part of textParts) {
                        if (!phoneTestRegex.test(part) && part.length > 2 && !part.match(/^\d+$/)) {
                          name = part;
                          break;
                        }
                      }
                    }
                    
                    // Clean the name
                    if (name && name !== 'Unknown') {
                      // Remove phone number from name
                      name = name.replace(ghanaPhoneRegex, '').trim();
                      // Remove extra whitespace and special characters that might be phone-related
                      name = name.replace(/[+\-()]/g, '').trim();
                      name = name.replace(/\s+/g, ' ').trim();
                    }
                    
                    if (!name || name.length === 0 || name.match(/^\d+$/)) {
                      name = 'Unknown';
                    }
                    
                    numbers.push({
                      number: cleaned,
                      name: name,
                      raw: match
                    });
                  });
                }
              });
            } catch (err) {
              // Continue if selector fails
            }
          });

          return numbers;
        });

        return phoneNumbers;
      } catch (error) {
        console.error('Error extracting numbers:', error.message);
        return [];
      }
    };

    // Monitor and extract phone numbers periodically
    const monitorInterval = setInterval(async () => {
      const numbers = await extractNumbers();
      
      let newCount = 0;
      numbers.forEach(phone => {
        const normalized = normalizePhoneNumber(phone.number);
        // Double-check it's a valid Ghana number
        if (normalized && normalized.startsWith('233') && normalized.length === 12) {
          const prefix = normalized.substring(3, 5);
          const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
          
          if (validPrefixes.includes(prefix)) {
            const phoneData = {
              number: normalized,
              name: phone.name || 'Unknown',
              formatted: `+${normalized}`
            };
            
            const phoneKey = normalized; // Use normalized number as key for deduplication
            if (!extractedNumbers.has(phoneKey)) {
              extractedNumbers.set(phoneKey, phoneData);
              newCount++;
              
              // Log to file in real-time
              logRealtime(phoneData, phone.name);
            } else {
              // Update name if we have a better one
              const existing = extractedNumbers.get(phoneKey);
              if (existing.name === 'Unknown' && phone.name && phone.name !== 'Unknown') {
                existing.name = phone.name;
                extractedNumbers.set(phoneKey, existing);
              }
            }
          }
        }
      });

      const currentCount = extractedNumbers.size;
      if (newCount > 0) {
        console.log(`✅ Extracted ${currentCount} Ghana phone numbers (${newCount} new)`);
        lastCount = currentCount;
      }

      // Auto-scroll if needed (optional - can be disabled)
      try {
        // Check if we're in the members list
        const isMembersList = await page.evaluate(() => {
          return document.querySelector('[data-testid="drawer-right"]') !== null ||
                 document.querySelector('div[aria-label*="member"]') !== null ||
                 document.querySelector('span:contains("View all")') !== null;
        });

        if (isMembersList && scrollAttempts < maxScrollAttempts) {
          // Try to find and click "View all" or scroll the members list
          await page.evaluate(() => {
            const viewAllButton = Array.from(document.querySelectorAll('span')).find(
              el => el.textContent.includes('View all') || el.textContent.includes('more')
            );
            
            if (viewAllButton) {
              viewAllButton.click();
            }

            // Scroll the members container
            const membersContainer = document.querySelector('[data-testid="drawer-right"]') ||
                                   document.querySelector('[role="list"]') ||
                                   document.querySelector('div[style*="overflow"]');
            
            if (membersContainer) {
              membersContainer.scrollTop += 500;
            } else {
              // Fallback: scroll the window
              window.scrollBy(0, 300);
            }
          });
          
          scrollAttempts++;
        }
      } catch (error) {
        // Ignore scroll errors
      }
    }, 2000); // Check every 2 seconds

    // Save function
    const saveExtractedNumbers = async () => {
      clearInterval(monitorInterval);
      
      // Flush any remaining Excel entries
      await flushExcelCache();
      
      // Convert Map to array of phone data objects
      const phoneNumbersArray = Array.from(extractedNumbers.values());
      
      // Final deduplication (should already be unique, but double-check)
      const uniqueNumbers = deduplicatePhoneNumbers(phoneNumbersArray);
      
      // Filter to ensure only valid Ghana numbers
      const ghanaNumbers = uniqueNumbers.filter(phone => {
        const num = phone.number || phone;
        const normalized = normalizePhoneNumber(num);
        if (normalized && normalized.startsWith('233') && normalized.length === 12) {
          const prefix = normalized.substring(3, 5);
          const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
          return validPrefixes.includes(prefix);
        }
        return false;
      });
      
      if (ghanaNumbers.length > 0) {
        console.log(`\n💾 Saving ${ghanaNumbers.length} Ghana phone numbers...\n`);
        await savePhoneNumbers(ghanaNumbers, OUTPUT_FILE);
        console.log('\n✨ Scraping completed!');
      } else {
        console.log('\n⚠️  No Ghana phone numbers were extracted.');
        console.log('Make sure you have the group members list open and visible.');
        console.log('Also ensure the members have Ghana phone numbers (+233XXXXXXXXX).');
      }
    };

    // Handle Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\n\n⏹️  Stopping scraper...');
      await saveExtractedNumbers();
      await browser.close();
      process.exit(0);
    });

    // Keep the script running
    await new Promise(() => {}); // Run indefinitely until interrupted

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

// Run the scraper
scrapePhoneNumbers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

