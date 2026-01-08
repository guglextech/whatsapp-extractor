# Phone Number Scraper - Complete Documentation

A Node.js project to scrape phone numbers from WhatsApp groups and Telegram channels using multiple automation approaches.

---

## Table of Contents

1. [Main README](#main-readme)
2. [Safety Guide](#safety-guide)
3. [WhatsApp Scroll Scraper](#whatsapp-scroll-scraper)
4. [Output Locations](#output-locations)
5. [Excel Logging](#excel-logging)
6. [Real-Time Logging](#real-time-logging)
7. [Browser Extension](#browser-extension)

---

# Main README

## ⚠️ Important Disclaimer

- This tool is for educational purposes only
- Scraping WhatsApp data may violate WhatsApp's Terms of Service
- Use responsibly and only with groups you have permission to access
- Respect privacy and data protection laws in your jurisdiction

## 🚀 Features

- **Multiple Platforms**: Support for WhatsApp groups and Telegram channels
- **Multiple Scraping Approaches**: Choose from 4 different methods
- **Multiple Output Formats**: JSON, CSV, and TXT files
- **Phone Number Validation**: Automatically validates and formats phone numbers
- **Deduplication**: Removes duplicate phone numbers
- **Easy Configuration**: Simple `.env` file setup

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- WhatsApp account (for WhatsApp scraping)
- Telegram account (for Telegram scraping)
- Telegram API credentials (for Telegram scraping - see setup below)
- Access to the group/channel you want to scrape

## 🛠️ Installation

1. Clone or navigate to the project directory:
```bash
cd scrappers
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration:

**For WhatsApp:**
```env
GROUP_NAME=Your Group Name Here
OUTPUT_FILE=output/phone-numbers.json
SCRAPER_APPROACH=whatsapp-web
```

**For Telegram:**
```env
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_CHANNEL_USERNAME=channel_username
OUTPUT_FILE=output/phone-numbers.json
SCRAPER_APPROACH=telegram
```

**Getting Telegram API Credentials:**
1. Go to https://my.telegram.org/apps
2. Log in with your phone number
3. Create a new application
4. Copy the `api_id` and `api_hash` to your `.env` file

## 📖 Usage

### Method 1: Using whatsapp-web.js (Recommended)

This is the most reliable approach using the `whatsapp-web.js` library.

```bash
npm run scraper:whatsapp-web
```

**Steps:**
1. Run the command
2. Scan the QR code displayed in the terminal with your WhatsApp mobile app
3. Wait for the scraper to extract phone numbers
4. Results will be saved in the output directory

### Method 2: Using Puppeteer

Direct browser automation using Puppeteer.

```bash
npm run scraper:puppeteer
```

**Steps:**
1. Run the command (browser window will open)
2. Scan the QR code in the browser
3. The scraper will automatically navigate to your group
4. Results will be saved in the output directory

### Method 3: Using Playwright

Similar to Puppeteer but using Playwright.

```bash
npm run scraper:playwright
```

**Steps:**
1. Run the command (browser window will open)
2. Scan the QR code in the browser
3. The scraper will automatically navigate to your group
4. Results will be saved in the output directory

### Method 4: Telegram Channel Scraper

Scrape phone numbers from Telegram channels using the Telegram Client API.

```bash
npm run scraper:telegram
```

**Prerequisites:**
- Get your Telegram API credentials from https://my.telegram.org/apps
- Add `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` to your `.env` file
- Set `TELEGRAM_CHANNEL_USERNAME` to the channel username (without @)

**Steps:**
1. Configure your `.env` file with Telegram credentials
2. Run the command
3. Enter your phone number when prompted
4. Enter the verification code sent to your Telegram
5. The scraper will extract phone numbers from channel members
6. Results will be saved in the output directory

**Note:** You need to be an admin of the channel or the channel must allow member visibility.

### Using the Main Entry Point

You can also use the main entry point which reads the `SCRAPER_APPROACH` from `.env`:

```bash
npm start
```

## 📁 Output Files

The scraper generates three output files in the `output/` directory:

1. **`phone-numbers.json`**: Structured JSON with metadata
2. **`phone-numbers.csv`**: CSV format for spreadsheet applications
3. **`phone-numbers.txt`**: Simple text file with one number per line

### JSON Format Example:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "total": 25,
  "phoneNumbers": [
    {
      "number": "1234567890",
      "name": "John Doe",
      "formatted": "+1234567890"
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

**WhatsApp Variables:**
| Variable | Description | Default |
|----------|-------------|---------|
| `GROUP_NAME` | Exact name of the WhatsApp group | Required |
| `OUTPUT_FILE` | Output file path (without extension) | `output/phone-numbers.json` |
| `SCRAPER_APPROACH` | Scraper method: `whatsapp-web`, `puppeteer`, `playwright`, or `telegram` | `whatsapp-web` |

**Telegram Variables:**
| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_API_ID` | Your Telegram API ID from https://my.telegram.org/apps | Required |
| `TELEGRAM_API_HASH` | Your Telegram API Hash from https://my.telegram.org/apps | Required |
| `TELEGRAM_CHANNEL_USERNAME` | Channel username (without @) | Required |
| `TELEGRAM_SESSION_FILE` | Session file path | `sessions/telegram.session` |
| `OUTPUT_FILE` | Output file path (without extension) | `output/phone-numbers.json` |
| `SCRAPER_APPROACH` | Set to `telegram` | `telegram` |

## 📂 Project Structure

```
scrappers/
├── src/
│   ├── scrapers/
│   │   ├── whatsapp-web-scraper.js    # Recommended WhatsApp approach
│   │   ├── puppeteer-scraper.js       # Puppeteer WhatsApp approach
│   │   ├── playwright-scraper.js      # Playwright WhatsApp approach
│   │   └── telegram-scraper.js         # Telegram channel scraper
│   └── utils/
│       ├── fileHandler.js              # File operations
│       └── phoneUtils.js               # Phone number utilities
├── output/                             # Generated output files
├── sessions/                           # Session data (WhatsApp & Telegram)
├── .env                                # Configuration file
├── .env.example                        # Example configuration
├── package.json
└── README.md
```

## 🔍 How Each Approach Works

### 1. whatsapp-web.js (Recommended)
- Uses the official WhatsApp Web protocol
- Most stable and reliable
- Handles authentication automatically
- Stores session for future use
- **Best for**: Production use, reliability

### 2. Puppeteer
- Direct browser automation
- More control over browser behavior
- Requires manual QR code scanning
- **Best for**: Custom automation needs

### 3. Playwright
- Similar to Puppeteer
- Cross-browser support
- Modern API
- **Best for**: Testing different browsers

### 4. Telegram (GramJS)
- Uses Telegram Client API (MTProto)
- Direct access to channel members
- Session-based authentication
- **Best for**: Telegram channel scraping

## 🐛 Troubleshooting

### QR Code Not Appearing
- Make sure WhatsApp Web is not connected on another device
- Close other WhatsApp Web sessions
- Try running the scraper again

### Group Not Found
- Verify the group name matches exactly (case-sensitive)
- Check that you have access to the group
- List available groups in the error message

### Authentication Issues
- Delete the `sessions/` folder and try again
- Make sure your phone has internet connection
- Check if WhatsApp Web is blocked on your network

### No Participants Found
- Ensure you have permission to view group participants
- Some groups may restrict participant visibility
- Try a different scraper approach

### Telegram Authentication Issues
- Verify your API credentials are correct
- Make sure you're using the correct phone number format (with country code)
- Check that the verification code is entered correctly
- Delete `sessions/telegram.session` and try again

### Telegram Channel Access Denied
- You need to be an admin of the channel to view members
- Some channels have privacy settings that hide member phone numbers
- Verify the channel username is correct (without @)

## 🔒 Security & Privacy

- Session data is stored locally in the `sessions/` directory
- Never commit `.env` files or session data to version control
- Phone numbers are stored locally only
- Be mindful of data protection regulations (GDPR, etc.)

## 📝 Notes

- The first run will require QR code scanning
- Subsequent runs with `whatsapp-web.js` may reuse the session
- Phone numbers are normalized to international format
- Duplicate numbers are automatically removed

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements.

## 📄 License

MIT License - Use responsibly and ethically.

## 🙏 Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API
- [Puppeteer](https://pptr.dev/) - Browser automation
- [Playwright](https://playwright.dev/) - Browser automation
- [GramJS (telegram)](https://github.com/gram-js/gramjs) - Telegram Client API

---

# Safety Guide

## ⚠️ Important Disclaimer

**All automated scraping of WhatsApp violates Meta's Terms of Service.** However, some approaches are safer than others. This guide ranks approaches by risk level.

---

## 🟢 SAFEST (Lowest Risk)

### 1. **Browser Extension with Manual Scrolling** ⭐ RECOMMENDED
**File:** `src/scrapers/whatsapp-browser-extension/content.js`

**Risk Level:** 🟢 **LOWEST**

**Why it's safest:**
- ✅ You manually control all actions (scrolling, clicking)
- ✅ No automation - just extraction of visible data
- ✅ Runs in your normal browser session
- ✅ Mimics normal human behavior perfectly
- ✅ No suspicious API calls or automated actions
- ✅ Meta sees it as normal browser usage

**How it works:**
- You manually scroll through members
- Extension only reads what's already visible
- No automated scrolling or clicking
- Looks like normal WhatsApp Web usage

**Recommendations:**
- Scroll at human-like speeds (not too fast)
- Take breaks between sessions
- Don't extract from too many groups in one session
- Use during normal hours (not 24/7)

---

## 🟡 MODERATE RISK

### 2. **Puppeteer Script with Manual Control**
**File:** `src/scrapers/whatsapp-web-scroll-scraper.js`

**Risk Level:** 🟡 **MODERATE**

**Why it's moderate risk:**
- ⚠️ Uses automated browser (Puppeteer)
- ⚠️ Can be detected as automated browser
- ✅ But you still control scrolling manually
- ✅ No rapid-fire API calls
- ⚠️ Browser fingerprint may look suspicious

**How to make it safer:**
- Disable auto-scroll feature
- Scroll manually at human speed
- Use headless: false (visible browser)
- Add random delays between actions
- Don't run 24/7
- Limit sessions to 1-2 hours

**Detection risks:**
- Puppeteer/Playwright browsers have detectable signatures
- Meta may flag automated browser sessions
- Rapid actions can trigger rate limits

---

### 3. **whatsapp-web.js Library**
**File:** `src/scrapers/whatsapp-web-scraper.js`

**Risk Level:** 🟡 **MODERATE to HIGH**

**Why it's risky:**
- ⚠️ Uses WhatsApp Web protocol directly
- ⚠️ Can make many API calls quickly
- ⚠️ Easily detectable as automation
- ⚠️ No human-like behavior simulation
- ⚠️ May trigger rate limiting

**How to make it safer:**
- Add delays between participant fetches
- Limit number of groups per session
- Don't run frequently
- Use session persistence (don't reconnect often)
- Add random delays (2-5 seconds between actions)

**Detection risks:**
- Direct protocol usage is monitored
- Rapid sequential API calls are suspicious
- No human behavior patterns

---

## 🔴 HIGHEST RISK

### 4. **Puppeteer/Playwright Full Automation**
**Files:** `puppeteer-scraper.js`, `playwright-scraper.js`

**Risk Level:** 🔴 **HIGH**

**Why it's high risk:**
- ❌ Fully automated browser control
- ❌ Rapid automated actions
- ❌ Easily detectable automation signatures
- ❌ No human-like delays or behavior
- ❌ Can trigger multiple security checks

**Detection risks:**
- Automated browser fingerprints
- Unnatural interaction patterns
- Rapid sequential actions
- Missing human behavior cues

**Not recommended for:**
- Production use
- Frequent scraping
- Large-scale operations

---

## 📊 Safety Comparison Table

| Approach | Risk Level | Automation | Human Control | Detection Risk | Recommended? |
|----------|-----------|------------|---------------|----------------|--------------|
| **Browser Extension** | 🟢 LOW | None | Full | Very Low | ✅ YES |
| **Puppeteer Manual** | 🟡 MODERATE | Partial | Partial | Medium | ⚠️ With caution |
| **whatsapp-web.js** | 🟡 MODERATE-HIGH | High | None | Medium-High | ⚠️ Risky |
| **Full Automation** | 🔴 HIGH | Full | None | High | ❌ NO |

---

## 🛡️ General Safety Tips (Apply to ALL approaches)

### 1. **Rate Limiting**
- ✅ Add delays between actions (2-5 seconds minimum)
- ✅ Don't scrape more than 1-2 groups per hour
- ✅ Take breaks between sessions (30+ minutes)

### 2. **Session Management**
- ✅ Use session persistence (don't reconnect frequently)
- ✅ Don't create multiple sessions simultaneously
- ✅ Log out properly when done

### 3. **Behavior Patterns**
- ✅ Scrape during normal hours (9 AM - 9 PM)
- ✅ Don't run 24/7
- ✅ Vary your scraping times
- ✅ Scroll at human-like speeds

### 4. **Volume Limits**
- ✅ Limit to 1-5 groups per day
- ✅ Don't extract thousands of numbers rapidly
- ✅ Spread extraction over multiple days

### 5. **Account Health**
- ✅ Use a secondary/test account if possible
- ✅ Don't combine with other automation tools
- ✅ Monitor for warning messages from WhatsApp

---

## 🚨 Warning Signs of Account Risk

Watch out for these indicators:

- ⚠️ **Rate limit messages** - "Too many requests"
- ⚠️ **Temporary restrictions** - "Account temporarily restricted"
- ⚠️ **Verification requests** - Frequent CAPTCHAs or phone verification
- ⚠️ **Connection issues** - Frequent disconnections
- ⚠️ **Suspicious activity warnings** - Messages from WhatsApp

**If you see these:** Stop immediately and wait 24-48 hours before resuming.

---

## ✅ Recommended Approach

### **Browser Extension with Manual Scrolling**

**Why:**
1. Lowest detection risk
2. Full human control
3. No automation signatures
4. Natural browser behavior
5. Easy to use

**Usage:**
1. Install extension
2. Open WhatsApp Web normally
3. Manually scroll through members
4. Extension extracts visible numbers
5. Save when done

**This is the safest method because:**
- You're using WhatsApp Web exactly as intended
- No automation is involved
- Meta sees normal user behavior
- Only extracts what you can already see

---

## 📝 Legal & Ethical Considerations

1. **Terms of Service:** All automation violates WhatsApp ToS
2. **Privacy:** Only scrape groups you have permission to access
3. **Data Protection:** Comply with GDPR and local privacy laws
4. **Ethical Use:** Don't misuse extracted phone numbers

---

## 🎯 Final Recommendation

**For maximum safety:**
- ✅ Use the **Browser Extension**
- ✅ Scroll manually at normal speed
- ✅ Limit to 1-2 groups per session
- ✅ Take breaks between sessions
- ✅ Use during normal hours

**Remember:** Even the safest approach can result in account restrictions if used excessively or inappropriately. Use responsibly and at your own risk.

---

# WhatsApp Scroll Scraper

A simple tool that monitors WhatsApp Web and extracts phone numbers from group members as you scroll through the list.

## 🚀 Quick Start

### Option 1: Puppeteer Script (Recommended)

```bash
npm run scraper:whatsapp-scroll
```

**How it works:**
1. Opens WhatsApp Web in a browser window
2. You log in and navigate to the group members list
3. The script monitors the page and extracts phone numbers automatically
4. Press `Ctrl+C` to stop and save all extracted numbers

**Features:**
- ✅ Real-time monitoring
- ✅ Automatic extraction as you scroll
- ✅ Saves to JSON, CSV, and TXT
- ✅ Automatic deduplication
- ✅ Progress indicators

### Option 2: Browser Extension (Easiest)

The browser extension provides a clean UI overlay on WhatsApp Web.

**Installation:**

1. **Chrome/Edge/Brave:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `src/scrapers/whatsapp-browser-extension` folder

2. **Firefox:**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the extension folder

**Usage:**
1. Go to [web.whatsapp.com](https://web.whatsapp.com)
2. Open a group and click on group name → "Group Info"
3. Click "Start" on the green overlay (top right)
4. Scroll through members list
5. Click "Save" to download files or "Copy" to clipboard

## 📋 Instructions

### Using the Puppeteer Script:

1. **Run the script:**
   ```bash
   npm run scraper:whatsapp-scroll
   ```

2. **In the browser window:**
   - Scan QR code if needed
   - Open the WhatsApp group you want to scrape
   - Click on the group name to open "Group Info"
   - You should see the members list

3. **Let it monitor:**
   - The script will automatically extract phone numbers
   - It will show progress: "✅ Extracted X phone numbers"
   - Scroll through the members list manually or let it auto-scroll

4. **Stop and save:**
   - Press `Ctrl+C` when done
   - All extracted numbers will be saved to `output/whatsapp-scroll-numbers.json` (and CSV/TXT)

### Using the Browser Extension:

1. **Install the extension** (see above)

2. **Use it:**
   - Navigate to WhatsApp Web
   - Open group → Group Info
   - Click "Start" on the overlay
   - Scroll through members
   - Click "Save" or "Copy"

## 🎯 Tips

- **Scroll slowly** to ensure all members are loaded
- The script extracts numbers from visible elements only
- If you see "View all (X more)", click it to load more members
- Numbers are automatically deduplicated
- The extension works in real-time as you scroll

## 📁 Output

Files are saved to:
- `output/whatsapp-scroll-numbers.json` - Structured data
- `output/whatsapp-scroll-numbers.csv` - Spreadsheet format
- `output/whatsapp-scroll-numbers.txt` - Simple text list

## ⚙️ Configuration

You can set these in `.env`:

```env
OUTPUT_FILE=output/whatsapp-scroll-numbers.json
```

## 🔒 Privacy

- All processing happens locally
- No data is sent anywhere
- Numbers are only saved to your local files
- The extension only runs on web.whatsapp.com

## 🐛 Troubleshooting

**No numbers extracted:**
- Make sure you're viewing the "Group Info" → Members list
- Scroll through the list to load more members
- Check browser console for errors (F12)

**Script not detecting members:**
- Make sure WhatsApp Web is fully loaded
- Try refreshing the page
- Ensure you have permission to view group members

**Extension not working:**
- Make sure it's enabled in browser extensions
- Refresh WhatsApp Web page
- Check browser console (F12) for errors

---

# Output Locations

## 📁 Where Phone Numbers Are Saved - Complete Guide

All phone numbers are saved **locally** on your computer. Here's exactly where each approach saves the files:

---

## 📍 Default Output Location

**Base Directory:** `/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/`

**Output Folder:** `output/` (created automatically if it doesn't exist)

---

## 📋 File Locations by Approach

### 1. **Browser Extension** (Safest Method)
**Location:** Your browser's **Downloads folder**

**Files:**
- `whatsapp-phone-numbers-[timestamp].json`
- `whatsapp-phone-numbers-[timestamp].csv`

**Full Path Examples:**
- Linux: `/home/samuelacquah/Downloads/whatsapp-phone-numbers-1234567890.json`
- Windows: `C:\Users\YourName\Downloads\whatsapp-phone-numbers-1234567890.json`
- macOS: `/Users/YourName/Downloads/whatsapp-phone-numbers-1234567890.json`

**How to access:**
- Click "Save" button in the extension overlay
- Files download automatically to your default Downloads folder
- Check your browser's download history if needed

---

### 2. **Puppeteer Scroll Scraper**
**Location:** `output/whatsapp-scroll-numbers.*`

**Files:**
- `output/whatsapp-scroll-numbers.json`
- `output/whatsapp-scroll-numbers.csv`
- `output/whatsapp-scroll-numbers.txt`

**Full Path:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/whatsapp-scroll-numbers.json
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/whatsapp-scroll-numbers.csv
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/whatsapp-scroll-numbers.txt
```

**Customize:** Set `OUTPUT_FILE` in `.env`:
```env
OUTPUT_FILE=output/my-custom-name.json
```

---

### 3. **whatsapp-web.js Scraper**
**Location:** `output/phone-numbers.*`

**Files:**
- `output/phone-numbers.json`
- `output/phone-numbers.csv`
- `output/phone-numbers.txt`

**Full Path:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.json
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.csv
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.txt
```

**Customize:** Set `OUTPUT_FILE` in `.env`:
```env
OUTPUT_FILE=output/whatsapp-group-numbers.json
```

---

### 4. **Puppeteer Scraper**
**Location:** `output/phone-numbers.*`

**Files:**
- `output/phone-numbers.json`
- `output/phone-numbers.csv`
- `output/phone-numbers.txt`

**Full Path:** Same as whatsapp-web.js scraper above

---

### 5. **Playwright Scraper**
**Location:** `output/phone-numbers.*`

**Files:**
- `output/phone-numbers.json`
- `output/phone-numbers.csv`
- `output/phone-numbers.txt`

**Full Path:** Same as whatsapp-web.js scraper above

---

### 6. **Telegram Scraper**
**Location:** `output/phone-numbers.*`

**Files:**
- `output/phone-numbers.json`
- `output/phone-numbers.csv`
- `output/phone-numbers.txt`

**Full Path:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.json
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.csv
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.txt
```

**Customize:** Set `OUTPUT_FILE` in `.env`:
```env
OUTPUT_FILE=output/telegram-channel-numbers.json
```

---

## 📂 Complete Directory Structure

```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/
├── output/                                    ← All files saved here (except browser extension)
│   ├── phone-numbers.json                    ← Default for most scrapers
│   ├── phone-numbers.csv
│   ├── phone-numbers.txt
│   ├── whatsapp-scroll-numbers.json          ← Scroll scraper
│   ├── whatsapp-scroll-numbers.csv
│   └── whatsapp-scroll-numbers.txt
│
├── sessions/                                  ← Session data (not phone numbers)
│   ├── telegram.session                      ← Telegram auth session
│   └── ...                                    ← WhatsApp sessions
│
└── Downloads/                                 ← Browser extension saves here
    └── whatsapp-phone-numbers-[timestamp].json
    └── whatsapp-phone-numbers-[timestamp].csv
```

---

## 🔍 How to Find Your Files

### Method 1: Command Line
```bash
# Navigate to project directory
cd /home/samuelacquah/Documents/Project-Boards/Backends/scrappers

# List all output files
ls -lh output/

# View a JSON file
cat output/phone-numbers.json

# View a CSV file
cat output/phone-numbers.csv
```

### Method 2: File Manager
1. Open your file manager
2. Navigate to: `/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/`
3. All files will be there

### Method 3: Browser Extension Files
1. Open your Downloads folder
2. Look for files starting with `whatsapp-phone-numbers-`
3. Sort by date to find the latest

---

## 📝 File Formats Explained

### JSON Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "total": 25,
  "phoneNumbers": [
    {
      "number": "1234567890",
      "name": "John Doe",
      "formatted": "+1234567890"
    }
  ]
}
```

### CSV Format
```csv
Name,Phone Number,Formatted
John Doe,1234567890,+1234567890
Jane Smith,0987654321,+0987654321
```

### TXT Format
```
John Doe: +1234567890
Jane Smith: +0987654321
```

---

## ⚙️ Customizing Output Location

### For Node.js Scripts:
Edit your `.env` file:
```env
OUTPUT_FILE=output/my-custom-filename.json
```

Or use absolute path:
```env
OUTPUT_FILE=/home/samuelacquah/Documents/my-numbers.json
```

### For Browser Extension:
The extension always saves to your browser's Downloads folder. You cannot change this, but you can:
- Move files after downloading
- Change your browser's default download location in browser settings

---

## 🔒 Privacy & Security

✅ **All files are saved locally only**
- No data is sent to any server
- No cloud storage
- No external services
- Everything stays on your computer

✅ **Files are in your control**
- You can delete them anytime
- You can move them anywhere
- You can encrypt them if needed

---

## 📊 Quick Reference Table

| Approach | Default Location | File Names | Customizable? |
|----------|-----------------|------------|-------------|
| Browser Extension | Downloads folder | `whatsapp-phone-numbers-[timestamp].*` | ❌ No |
| Scroll Scraper | `output/` | `whatsapp-scroll-numbers.*` | ✅ Yes (via .env) |
| whatsapp-web.js | `output/` | `phone-numbers.*` | ✅ Yes (via .env) |
| Puppeteer | `output/` | `phone-numbers.*` | ✅ Yes (via .env) |
| Playwright | `output/` | `phone-numbers.*` | ✅ Yes (via .env) |
| Telegram | `output/` | `phone-numbers.*` | ✅ Yes (via .env) |

---

## 🎯 Summary

**Most scrapers save to:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/
```

**Browser extension saves to:**
```
Your browser's Downloads folder (usually ~/Downloads/)
```

**All files are:**
- ✅ Saved locally on your computer
- ✅ Never sent anywhere
- ✅ Under your complete control
- ✅ In standard formats (JSON, CSV, TXT)

---

# Excel Logging

## 📊 Excel Logging - Simple & Clean

All phone numbers are automatically logged to an Excel file on your PC.

## 📁 Location

**File:** `output/phone-numbers.xlsx`

**Full Path:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/phone-numbers.xlsx
```

## ✨ Features

- ✅ **Creates file automatically** if it doesn't exist
- ✅ **Appends new numbers** if file exists (no duplicates)
- ✅ **Auto-deduplication** - same number won't be added twice
- ✅ **Clean columns**: Name, Phone Number, Formatted, Date Added
- ✅ **Works with all scrapers** automatically

## 📋 Excel Format

| Name | Phone Number | Formatted | Date Added |
|------|--------------|-----------|------------|
| John Doe | 1234567890 | +1234567890 | 2024-01-15T10:30:00.000Z |
| Jane Smith | 0987654321 | +0987654321 | 2024-01-15T10:31:00.000Z |

## 🎯 How It Works

1. **First run:** Creates `phone-numbers.xlsx` with headers
2. **Subsequent runs:** Reads existing file, adds new numbers, removes duplicates
3. **All scrapers:** Automatically log to the same Excel file

## ⚙️ Customize Location

Edit `.env` file:
```env
EXCEL_FILE=output/my-custom-file.xlsx
```

Or use absolute path:
```env
EXCEL_FILE=/home/samuelacquah/Documents/my-numbers.xlsx
```

## 📝 Notes

- File is created in `output/` folder automatically
- All numbers are deduplicated by phone number
- Date Added column shows when each number was logged
- Works seamlessly with all existing scrapers

---

# Real-Time Logging

## 📝 Real-Time Logging - Simple & Clean

Phone numbers are logged to a file **in real-time** as you scroll through the WhatsApp group members.

## 📁 Log File Location

**File:** `output/realtime-numbers.log`

**Full Path:**
```
/home/samuelacquah/Documents/Project-Boards/Backends/scrappers/output/realtime-numbers.log
```

## ✨ Features

- ✅ **Real-time logging** - Numbers saved immediately as found
- ✅ **Simple text format** - Easy to read
- ✅ **Timestamped entries** - Know when each number was found
- ✅ **Auto-creates file** - No setup needed
- ✅ **Appends continuously** - All numbers in one file

## 📋 Log Format

```
# Phone Numbers Log
# Started: 2024-01-15T10:30:00.000Z
# Format: [timestamp] name: phone

[2024-01-15T10:30:15.123Z] John Doe: +1234567890
[2024-01-15T10:30:16.456Z] Jane Smith: +0987654321
[2024-01-15T10:30:17.789Z] Unknown: +5551234567
```

## 🎯 How It Works

1. **Start scrolling** through WhatsApp group members
2. **Numbers are logged immediately** as they're found
3. **File updates in real-time** - you can watch it grow
4. **All numbers saved** - even if you stop the scraper

## 📖 Usage

Just run the scroll scraper:
```bash
npm run scraper:whatsapp-scroll
```

The log file is created automatically and numbers are logged as you scroll.

## 👀 Watch the Log File

You can watch the file update in real-time:

```bash
# Watch the log file
tail -f output/realtime-numbers.log

# Or view it
cat output/realtime-numbers.log
```

## ⚙️ Customize Location

Edit `.env` file:
```env
REALTIME_LOG_FILE=output/my-custom-log.log
```

## 📊 Summary

- **File:** `output/realtime-numbers.log`
- **Format:** Simple text with timestamps
- **Updates:** In real-time as you scroll
- **No setup:** Works automatically

Simple, clean, and works perfectly! 🎉

---

# Browser Extension

## WhatsApp Phone Number Extractor - Browser Extension

A simple browser extension that extracts phone numbers from WhatsApp Web group members list as you scroll.

## 🚀 Installation

### Chrome/Edge/Brave:

1. Open your browser and go to `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `whatsapp-browser-extension` folder
5. The extension is now installed!

### Firefox:

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the extension folder

## 📖 Usage

1. Go to [web.whatsapp.com](https://web.whatsapp.com) and log in
2. Open a group chat
3. Click on the group name to open "Group Info"
4. Scroll through the members list
5. Click "Start" on the green overlay (top right)
6. Continue scrolling - phone numbers will be extracted automatically
7. Click "Save" to download JSON and CSV files
8. Or click "Copy" to copy all numbers to clipboard

## ✨ Features

- ✅ Real-time extraction as you scroll
- ✅ Automatic deduplication
- ✅ Save to JSON and CSV
- ✅ Copy to clipboard
- ✅ Clean, non-intrusive UI
- ✅ Works with WhatsApp Web

## 📝 Notes

- The extension only extracts visible phone numbers
- You need to scroll through the members list for all numbers to be extracted
- Numbers are automatically deduplicated
- The extension only works on web.whatsapp.com

---

## End of Documentation

This document contains all the documentation for the WhatsApp Phone Number Scraper project. For questions or issues, please refer to the troubleshooting sections or create an issue in the project repository.

