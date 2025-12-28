import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { savePhoneNumbers } from '../utils/fileHandler.js';
import { normalizePhoneNumber, deduplicatePhoneNumbers } from '../utils/phoneUtils.js';

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

    // Wait for WhatsApp Web to load
    await page.waitForSelector('[data-testid="chatlist"]', { timeout: 120000 }).catch(() => {
      console.log('⚠️  WhatsApp Web loaded (or already logged in)\n');
    });

    // Set up phone number extraction
    const extractedNumbers = new Set();
    let lastCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 1000; // Prevent infinite scrolling

    // Function to extract phone numbers from the page
    const extractNumbers = async () => {
      try {
        const phoneNumbers = await page.evaluate(() => {
          const numbers = [];
          
          // Look for phone numbers in various possible selectors
          const selectors = [
            '[data-testid="cell-frame-container"]',
            '[role="listitem"]',
            'span[title*="+"]',
            'div[title*="+"]',
          ];

          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              // Get text content
              const text = el.textContent || el.innerText || '';
              
              // Extract phone numbers using regex
              const phoneRegex = /\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
              const matches = text.match(phoneRegex);
              
              if (matches) {
                matches.forEach(match => {
                  // Clean and normalize
                  const cleaned = match.replace(/\D/g, '');
                  if (cleaned.length >= 7 && cleaned.length <= 15) {
                    // Try to get associated name
                    const nameElement = el.querySelector('span[title]') || 
                                      el.closest('[data-testid]')?.querySelector('span');
                    const name = nameElement?.getAttribute('title') || 
                               nameElement?.textContent?.trim() || 
                               'Unknown';
                    
                    numbers.push({
                      number: cleaned,
                      name: name.replace(/\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g, '').trim() || 'Unknown',
                      raw: match
                    });
                  }
                });
              }

              // Also check title attribute
              const title = el.getAttribute('title');
              if (title) {
                const titleMatches = title.match(/\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g);
                if (titleMatches) {
                  titleMatches.forEach(match => {
                    const cleaned = match.replace(/\D/g, '');
                    if (cleaned.length >= 7 && cleaned.length <= 15) {
                      numbers.push({
                        number: cleaned,
                        name: title.replace(/\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g, '').trim() || 'Unknown',
                        raw: match
                      });
                    }
                  });
                }
              }
            });
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
      
      numbers.forEach(phone => {
        const normalized = normalizePhoneNumber(phone.number);
        if (normalized) {
          extractedNumbers.add(JSON.stringify({
            number: normalized,
            name: phone.name,
            formatted: `+${normalized}`
          }));
        }
      });

      const currentCount = extractedNumbers.size;
      if (currentCount > lastCount) {
        console.log(`✅ Extracted ${currentCount} phone numbers (${currentCount - lastCount} new)`);
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
      
      const phoneNumbersArray = Array.from(extractedNumbers).map(str => JSON.parse(str));
      const uniqueNumbers = deduplicatePhoneNumbers(phoneNumbersArray);
      
      if (uniqueNumbers.length > 0) {
        console.log(`\n💾 Saving ${uniqueNumbers.length} phone numbers...\n`);
        await savePhoneNumbers(uniqueNumbers, OUTPUT_FILE);
        console.log('\n✨ Scraping completed!');
      } else {
        console.log('\n⚠️  No phone numbers were extracted.');
        console.log('Make sure you have the group members list open and visible.');
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

