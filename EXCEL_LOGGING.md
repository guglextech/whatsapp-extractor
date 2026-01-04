# 📊 Excel Logging - Simple & Clean

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

