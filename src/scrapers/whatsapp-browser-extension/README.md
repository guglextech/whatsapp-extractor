# WhatsApp Phone Number Extractor - Browser Extension

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

