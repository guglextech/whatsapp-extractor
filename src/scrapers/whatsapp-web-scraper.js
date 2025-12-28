import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { savePhoneNumbers } from '../utils/fileHandler.js';
import { normalizePhoneNumber, deduplicatePhoneNumbers } from '../utils/phoneUtils.js';

dotenv.config();

const GROUP_NAME = process.env.GROUP_NAME || '';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'output/phone-numbers.json';

/**
 * Main scraper using whatsapp-web.js library
 * This is the most reliable approach for WhatsApp Web automation
 */
async function scrapePhoneNumbers() {
  console.log('🚀 Starting WhatsApp Web Scraper...\n');
  
  if (!GROUP_NAME) {
    console.error('❌ Error: GROUP_NAME not set in .env file');
    console.log('Please set GROUP_NAME in your .env file with the exact group name');
    process.exit(1);
  }

  // Initialize the WhatsApp client
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './sessions'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  // QR Code generation
  client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with your WhatsApp mobile app:');
    console.log('(Make sure WhatsApp Web is not already connected on another device)\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⏳ Waiting for QR code scan...\n');
  });

  // Authentication
  client.on('ready', async () => {
    console.log('✅ WhatsApp client is ready!\n');
    console.log(`🔍 Looking for group: "${GROUP_NAME}"\n`);
    
    try {
      // Get all chats
      const chats = await client.getChats();
      
      // Find the group by name
      const group = chats.find(chat => 
        chat.isGroup && chat.name.toLowerCase() === GROUP_NAME.toLowerCase()
      );
      
      if (!group) {
        console.error(`❌ Group "${GROUP_NAME}" not found!`);
        console.log('\nAvailable groups:');
        chats
          .filter(chat => chat.isGroup)
          .forEach(chat => console.log(`  - ${chat.name}`));
        await client.destroy();
        process.exit(1);
      }
      
      console.log(`✅ Found group: ${group.name}`);
      console.log(`📊 Fetching participants...\n`);
      
      // Get group participants
      const participants = await group.participants;
      
      if (!participants || participants.length === 0) {
        console.log('⚠️  No participants found in the group');
        await client.destroy();
        process.exit(0);
      }
      
      console.log(`📱 Found ${participants.length} participants\n`);
      
      // Extract phone numbers
      const phoneNumbers = [];
      
      for (const participant of participants) {
        try {
          // Get contact information
          const contact = await client.getContactById(participant.id);
          
          const phoneNumber = normalizePhoneNumber(participant.id);
          const formatted = phoneNumber ? `+${phoneNumber}` : '';
          
          phoneNumbers.push({
            number: phoneNumber,
            name: contact.pushname || contact.name || contact.number || 'Unknown',
            formatted: formatted,
            id: participant.id
          });
          
          // Show progress
          process.stdout.write(`\r📥 Processing: ${phoneNumbers.length}/${participants.length}`);
        } catch (error) {
          console.error(`\n⚠️  Error processing participant ${participant.id}:`, error.message);
        }
      }
      
      console.log('\n\n🔄 Deduplicating phone numbers...');
      const uniquePhoneNumbers = deduplicatePhoneNumbers(phoneNumbers);
      
      console.log(`\n✅ Extracted ${uniquePhoneNumbers.length} unique phone numbers`);
      
      // Save to files
      console.log('\n💾 Saving phone numbers to files...\n');
      await savePhoneNumbers(uniquePhoneNumbers, OUTPUT_FILE);
      
      console.log('\n✨ Scraping completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during scraping:', error);
    } finally {
      await client.destroy();
      process.exit(0);
    }
  });

  // Error handling
  client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    process.exit(1);
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️  Client disconnected:', reason);
    process.exit(1);
  });

  // Initialize the client
  client.initialize();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Process interrupted. Cleaning up...');
  process.exit(0);
});

// Run the scraper
scrapePhoneNumbers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

