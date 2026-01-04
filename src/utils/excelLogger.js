import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE = process.env.EXCEL_FILE || path.join(process.cwd(), 'output', 'phone-numbers.xlsx');

/**
 * Simple Excel logger - creates file if it doesn't exist, appends if it does
 */
export async function logToExcel(phoneNumbers) {
  try {
    // Ensure output directory exists
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
        // Convert existing data to JSON
        existingData = XLSX.utils.sheet_to_json(worksheet);
      }
    } else {
      // Create new workbook
      workbook = XLSX.utils.book_new();
    }

    // Prepare new data
    const newRows = phoneNumbers.map(phone => ({
      'Name': phone.name || 'Unknown',
      'Phone Number': phone.number || '',
      'Formatted': phone.formatted || phone.number || '',
      'Date Added': new Date().toISOString()
    }));

    // Combine existing and new data, remove duplicates
    const allData = [...existingData, ...newRows];
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

    console.log(`✅ Logged ${phoneNumbers.length} numbers to Excel: ${EXCEL_FILE}`);
    console.log(`📊 Total unique numbers in file: ${uniqueData.length}`);

    return EXCEL_FILE;
  } catch (error) {
    console.error('❌ Error logging to Excel:', error.message);
    throw error;
  }
}

/**
 * Read existing Excel file
 */
export async function readExcel() {
  try {
    const fileExists = await fs.access(EXCEL_FILE).then(() => true).catch(() => false);
    
    if (!fileExists) {
      return [];
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]] || workbook.Sheets['Phone Numbers'];
    
    if (!worksheet) {
      return [];
    }

    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('❌ Error reading Excel:', error.message);
    return [];
  }
}

