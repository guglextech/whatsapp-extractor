# WhatsApp Web Scroll Scraper

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

