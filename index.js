import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APPROACH = process.env.SCRAPER_APPROACH || 'whatsapp-web';

/**
 * Main entry point that routes to the appropriate scraper
 */
async function main() {
  console.log('📱 Phone Number Scraper (WhatsApp & Telegram)\n');
  console.log('='.repeat(50));
  console.log(`Using approach: ${APPROACH}\n`);
  
  let scraperModule;
  
  try {
    switch (APPROACH.toLowerCase()) {
      case 'whatsapp-web':
        scraperModule = await import('./src/scrapers/whatsapp-web-scraper.js');
        break;
      case 'puppeteer':
        scraperModule = await import('./src/scrapers/puppeteer-scraper.js');
        break;
      case 'playwright':
        scraperModule = await import('./src/scrapers/playwright-scraper.js');
        break;
      case 'telegram':
        scraperModule = await import('./src/scrapers/telegram-scraper.js');
        break;
      default:
        console.error(`❌ Unknown scraper approach: ${APPROACH}`);
        console.log('\nAvailable approaches:');
        console.log('  - whatsapp-web (recommended for WhatsApp)');
        console.log('  - puppeteer (WhatsApp)');
        console.log('  - playwright (WhatsApp)');
        console.log('  - telegram (Telegram channels)');
        process.exit(1);
    }
    
    // The scrapers run their own logic when imported
    // They don't export functions, so we just import them
    
  } catch (error) {
    console.error('❌ Error loading scraper:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

