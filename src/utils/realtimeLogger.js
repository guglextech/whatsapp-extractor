import fs from 'fs/promises';
import path from 'path';
import XLSX from 'xlsx';

const LOG_FILE = process.env.REALTIME_LOG_FILE || path.join(process.cwd(), 'output', 'realtime-numbers.log');
const EXCEL_FILE = process.env.EXCEL_FILE || path.join(process.cwd(), 'output', 'phone-numbers.xlsx');

// Cache for Excel updates (batch writes)
let excelCache = [];
let excelWriteTimeout = null;

/**
 * Simple real-time logger - appends phone numbers as they're found
 * Also logs to Excel file
 */
export async function logRealtime(phoneNumber, name = 'Unknown') {
  try {
    // Ensure output directory exists
    const dir = path.dirname(LOG_FILE);
    await fs.mkdir(dir, { recursive: true });

    // Format: [timestamp] name: +phone
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${name}: ${phoneNumber.formatted || phoneNumber}\n`;

    // Append to log file
    await fs.appendFile(LOG_FILE, line, 'utf-8');
    
    // Add to Excel cache
    excelCache.push({
      'Name': name || 'Unknown',
      'Phone Number': phoneNumber.number || phoneNumber,
      'Formatted': phoneNumber.formatted || phoneNumber,
      'Date Added': timestamp
    });
    
    // Batch write to Excel (every 5 entries or 2 seconds)
    if (excelCache.length >= 5) {
      await writeToExcel();
    } else {
      // Schedule write if not already scheduled
      if (!excelWriteTimeout) {
        excelWriteTimeout = setTimeout(async () => {
          await writeToExcel();
          excelWriteTimeout = null;
        }, 2000);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error logging:', error.message);
    return false;
  }
}

/**
 * Write cached entries to Excel file
 */
async function writeToExcel() {
  if (excelCache.length === 0) return;
  
  try {
    const dir = path.dirname(EXCEL_FILE);
    await fs.mkdir(dir, { recursive: true });

    let workbook;
    let worksheet;
    let existingData = [];

    // Check if file exists
    const fileExists = await fs.access(EXCEL_FILE).then(() => true).catch(() => false);

    if (fileExists) {
      // Read existing file
      workbook = XLSX.readFile(EXCEL_FILE);
      worksheet = workbook.Sheets[workbook.SheetNames[0]] || workbook.Sheets['Phone Numbers'];
      
      if (worksheet) {
        existingData = XLSX.utils.sheet_to_json(worksheet);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Combine existing and new data, remove duplicates
    const allData = [...existingData, ...excelCache];
    const uniqueData = Array.from(
      new Map(allData.map(row => [row['Phone Number'], row])).values()
    );

    // Create worksheet
    worksheet = XLSX.utils.json_to_sheet(uniqueData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Name
      { wch: 15 }, // Phone Number
      { wch: 18 }, // Formatted
      { wch: 25 }  // Date Added
    ];

    // Add or update sheet
    if (workbook.SheetNames.includes('Phone Numbers')) {
      workbook.Sheets['Phone Numbers'] = worksheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Phone Numbers');
    }

    // Write file
    XLSX.writeFile(workbook, EXCEL_FILE);

    // Clear cache
    excelCache = [];
    
  } catch (error) {
    console.error('Error writing to Excel:', error.message);
  }
}

/**
 * Initialize log file with header
 */
export async function initLogFile() {
  try {
    const dir = path.dirname(LOG_FILE);
    await fs.mkdir(dir, { recursive: true });

    const fileExists = await fs.access(LOG_FILE).then(() => true).catch(() => false);
    
    if (!fileExists) {
      const header = `# Phone Numbers Log\n# Started: ${new Date().toISOString()}\n# Format: [timestamp] name: phone\n\n`;
      await fs.writeFile(LOG_FILE, header, 'utf-8');
      console.log(`📝 Real-time log file: ${LOG_FILE}`);
    }
    
    // Ensure Excel file directory exists
    const excelDir = path.dirname(EXCEL_FILE);
    await fs.mkdir(excelDir, { recursive: true });
    console.log(`📊 Excel file: ${EXCEL_FILE}`);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Flush any remaining cached entries to Excel
 */
export async function flushExcelCache() {
  if (excelCache.length > 0) {
    await writeToExcel();
  }
}

