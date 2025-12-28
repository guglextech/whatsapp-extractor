# Phone Number Scraper

A Node.js project to scrape phone numbers from WhatsApp groups and Telegram channels using multiple automation approaches.

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

# whatsapp-extractor
