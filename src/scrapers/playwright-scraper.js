import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { savePhoneNumbers } from '../utils/fileHandler.js';
import { normalizePhoneNumber, deduplicatePhoneNumbers, extractPhoneNumbers } from '../utils/phoneUtils.js';

dotenv.config();

const GROUP_NAME = process.env.GROUP_NAME || '';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'output/phone-numbers.json';
const WHATSAPP_WEB_URL = 'https://web.whatsapp.com';

/**
 * Alternative scraper using Playwright for browser automation
 * Similar to Puppeteer but with different API
 */
async function scrapePhoneNumbers() {
  console.log('🚀 Starting Playwright WhatsApp Scraper...\n');
  console.log('⚠️  Note: This approach requires manual interaction and may be less reliable\n');
  
  if (!GROUP_NAME) {
    console.error('❌ Error: GROUP_NAME not set in .env file');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('🌐 Navigating to WhatsApp Web...');
    await page.goto(WHATSAPP_WEB_URL, { waitUntil: 'networkidle' });
    
    console.log('📱 Please scan the QR code in the browser window...');
    console.log('⏳ Waiting for authentication...\n');
    
    // Wait for the main chat list to appear
    await page.waitForSelector('[data-testid="chatlist"]', { timeout: 120000 });
    console.log('✅ Successfully authenticated!\n');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    console.log(`🔍 Searching for group: "${GROUP_NAME}"\n`);
    
    // Search for the group
    const searchSelector = '[data-testid="chat-list-search"]';
    await page.waitForSelector(searchSelector);
    await page.fill(searchSelector, GROUP_NAME);
    await page.waitForTimeout(2000);
    
    // Click on the group from search results
    const groupSelector = `span[title="${GROUP_NAME}"]`;
    await page.waitForSelector(groupSelector, { timeout: 10000 });
    await page.click(groupSelector);
    await page.waitForTimeout(2000);
    
    console.log(`✅ Opened group: ${GROUP_NAME}\n`);
    
    // Click on group info/header
    const groupHeaderSelector = '[data-testid="conversation-header"]';
    await page.waitForSelector(groupHeaderSelector);
    await page.click(groupHeaderSelector);
    await page.waitForTimeout(2000);
    
    console.log('📊 Extracting participant information...\n');
    
    // Extract participant information
    const participants = await page.evaluate(() => {
      const participantElements = document.querySelectorAll('[data-testid="participant"]');
      const phoneNumbers = [];
      
      participantElements.forEach(element => {
        const nameElement = element.querySelector('span[title]');
        const name = nameElement ? nameElement.getAttribute('title') : 'Unknown';
        
        const phoneAttr = element.getAttribute('data-id') || 
                         element.getAttribute('id') || 
                         element.textContent;
        
        phoneNumbers.push({
          name: name,
          raw: phoneAttr
        });
      });
      
      return phoneNumbers;
    });
    
    if (participants.length === 0) {
      console.log('⚠️  No participants found. Trying alternative method...\n');
      
      // Alternative: Extract from page text
      const groupInfoText = await page.textContent('body');
      const extractedNumbers = extractPhoneNumbers(groupInfoText);
      
      const phoneNumbers = extractedNumbers.map(num => ({
        number: normalizePhoneNumber(num),
        name: 'Unknown',
        formatted: `+${normalizePhoneNumber(num)}`
      }));
      
      const uniqueNumbers = deduplicatePhoneNumbers(phoneNumbers);
      console.log(`✅ Extracted ${uniqueNumbers.length} phone numbers\n`);
      
      await savePhoneNumbers(uniqueNumbers, OUTPUT_FILE);
      console.log('\n✨ Scraping completed!');
      
      await browser.close();
      return;
    }
    
    console.log(`📱 Found ${participants.length} participants\n`);
    
    // Process phone numbers
    const phoneNumbers = participants.map(participant => {
      const number = normalizePhoneNumber(participant.raw);
      return {
        number: number,
        name: participant.name,
        formatted: number ? `+${number}` : ''
      };
    }).filter(p => p.number);
    
    const uniquePhoneNumbers = deduplicatePhoneNumbers(phoneNumbers);
    
    console.log(`✅ Extracted ${uniquePhoneNumbers.length} unique phone numbers\n`);
    
    // Save to files
    console.log('💾 Saving phone numbers to files...\n');
    await savePhoneNumbers(uniquePhoneNumbers, OUTPUT_FILE);
    
    console.log('\n✨ Scraping completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    console.log('\n💡 Tips:');
    console.log('   - Make sure you are logged into WhatsApp Web');
    console.log('   - Ensure the group name matches exactly');
    console.log('   - Try using the whatsapp-web.js approach for better reliability');
  } finally {
    console.log('\n⏳ Closing browser in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

// Run the scraper
scrapePhoneNumbers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

