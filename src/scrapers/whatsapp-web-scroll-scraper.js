import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { savePhoneNumbers } from "../utils/fileHandler.js";
import {
  normalizePhoneNumber,
  deduplicatePhoneNumbers,
} from "../utils/phoneUtils.js";
import {
  logRealtime,
  initLogFile,
  flushExcelCache,
} from "../utils/realtimeLogger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE =
  process.env.OUTPUT_FILE || "output/whatsapp-scroll-numbers.json";
const GROUP_NAME = process.env.GROUP_NAME || "";

/**
 * WhatsApp Web Scroll-Based Phone Number Scraper
 * Monitors the group members list and extracts phone numbers as you scroll
 */
async function scrapePhoneNumbers() {
  console.log("🚀 Starting WhatsApp Web Scroll Scraper...\n");
  console.log(
    "📱 This tool will monitor WhatsApp Web and extract phone numbers as you scroll\n",
  );
  console.log(
    "⚠️  Make sure WhatsApp Web is open and you are viewing the group members list\n",
  );
  console.log("Press Ctrl+C to stop and save extracted numbers\n");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Navigate to WhatsApp Web
    console.log("🌐 Opening WhatsApp Web...\n");
    await page.goto("https://web.whatsapp.com", { waitUntil: "networkidle2" });

    console.log(
      "⏳ Waiting for you to log in and open the group members list...\n",
    );
    console.log("📋 Instructions:");
    console.log("   1. Scan QR code if needed");
    console.log("   2. Open the group you want to scrape");
    console.log("   3. Click search icon to open 'Search members' modal");
    console.log("   4. Numbers will be extracted automatically\n");
    console.log("🔄 Monitoring 'Search members' modal for Ghana phone numbers...\n");

    // Initialize real-time log file
    await initLogFile();
    console.log("📝 Real-time logging enabled - numbers saved as you scroll\n");

    // Wait for WhatsApp Web to load
    await page
      .waitForSelector('[data-testid="chatlist"]', { timeout: 120000 })
      .catch(() => {
        console.log("⚠️  WhatsApp Web loaded (or already logged in)\n");
      });

    // Set up phone number extraction
    const extractedNumbers = new Set();
    let lastCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 1000; // Prevent infinite scrolling

    // Extract phone numbers from "Search members" modal
    const extractNumbers = async () => {
      try {
        const phoneNumbers = await page.evaluate(() => {
          const numbers = [];
          const seen = new Set();
          
          // Find "Search members" modal
          const searchModal = Array.from(document.querySelectorAll('span')).find(
            el => el.textContent === 'Search members'
          )?.closest('div[role="dialog"]') || 
          Array.from(document.querySelectorAll('*')).find(
            el => el.textContent?.includes('Search members')
          )?.closest('div');
          
          if (!searchModal) return numbers;
          
          // Ghana phone regex: +233 XX XXX XXXX or +233XXXXXXXXX
          const ghanaRegex = /(\+?233\s*[25][0-9]\s*\d{3}\s*\d{4}|\+?233[25][0-9]\d{7})/g;
          
          // Find all member items in modal
          const members = searchModal.querySelectorAll('[data-testid="cell-frame-container"], [role="listitem"]');
          
          members.forEach(member => {
            const text = member.textContent || '';
            const matches = text.match(ghanaRegex);
            
            if (matches) {
              matches.forEach(match => {
                let cleaned = match.replace(/\s+/g, '').replace(/\D/g, '');
                
                // Normalize to 233XXXXXXXXX
                if (cleaned.startsWith('233') && cleaned.length === 12) {
                  const prefix = cleaned.substring(3, 5);
                  const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
                  
                  if (validPrefixes.includes(prefix) && !seen.has(cleaned)) {
                    seen.add(cleaned);
                    
                    // Extract name
                    const nameEl = member.querySelector('span[title], span[dir="auto"]');
                    let name = nameEl?.getAttribute('title') || nameEl?.textContent || 'Unknown';
                    name = name.replace(ghanaRegex, '').trim() || 'Unknown';
                    
                    numbers.push({ number: cleaned, name, raw: match });
                  }
                }
              });
            }
          });
          
          return numbers;
        });

        return phoneNumbers;
      } catch (error) {
        console.error("Error extracting numbers:", error.message);
        return [];
      }
    };

    // Monitor and extract phone numbers periodically
    const monitorInterval = setInterval(async () => {
      const numbers = await extractNumbers();

      numbers.forEach((phone) => {
        const normalized = normalizePhoneNumber(phone.number);
        if (normalized) {
          const phoneData = {
            number: normalized,
            name: phone.name,
            formatted: `+${normalized}`,
          };

          // Add to set
          extractedNumbers.add(JSON.stringify(phoneData));

          // Log to file in real-time
          logRealtime(phoneData, phone.name);
        }
      });

      const currentCount = extractedNumbers.size;
      if (currentCount > lastCount) {
        console.log(
          `✅ Extracted ${currentCount} phone numbers (${currentCount - lastCount} new)`,
        );
        lastCount = currentCount;
      }

      // Auto-scroll search modal if needed
      try {
        await page.evaluate(() => {
          const searchModal = Array.from(document.querySelectorAll('span')).find(
            el => el.textContent === 'Search members'
          )?.closest('div[role="dialog"]');
          
          if (searchModal) {
            const scrollContainer = searchModal.querySelector('[role="list"]') || 
                                   searchModal.querySelector('div[style*="overflow"]') ||
                                   searchModal;
            if (scrollContainer) {
              scrollContainer.scrollTop += 300;
            }
          }
        });
      } catch (error) {
        // Ignore scroll errors
      }
    }, 2000); // Check every 2 seconds

    // Save function
    const saveExtractedNumbers = async () => {
      clearInterval(monitorInterval);

      // Flush any remaining Excel entries
      await flushExcelCache();

      const phoneNumbersArray = Array.from(extractedNumbers).map((str) =>
        JSON.parse(str),
      );
      const uniqueNumbers = deduplicatePhoneNumbers(phoneNumbersArray);

      if (uniqueNumbers.length > 0) {
        console.log(`\n💾 Saving ${uniqueNumbers.length} phone numbers...\n`);
        await savePhoneNumbers(uniqueNumbers, OUTPUT_FILE);
        console.log("\n✨ Scraping completed!");
      } else {
        console.log("\n⚠️  No Ghana phone numbers were extracted.");
        console.log("Make sure the 'Search members' modal is open.");
      }
    };

    // Handle Ctrl+C
    process.on("SIGINT", async () => {
      console.log("\n\n⏹️  Stopping scraper...");
      await saveExtractedNumbers();
      await browser.close();
      process.exit(0);
    });

    // Keep the script running
    await new Promise(() => {}); 
  } catch (error) {
    console.error("❌ Error:", error.message);
    await browser.close();
    process.exit(1);
  }
}

// Run the scraper
scrapePhoneNumbers().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
