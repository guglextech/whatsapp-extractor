# 📝 Real-Time Logging - Simple & Clean

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

