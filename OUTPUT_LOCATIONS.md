# 📁 Where Phone Numbers Are Saved - Complete Guide

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

