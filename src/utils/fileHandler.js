import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logToExcel } from './excelLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensures the output directory exists
 */
export async function ensureOutputDir(outputPath) {
  const dir = path.dirname(outputPath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Saves phone numbers to a JSON file
 */
export async function savePhoneNumbersToJSON(phoneNumbers, outputPath) {
  await ensureOutputDir(outputPath);
  
  const data = {
    timestamp: new Date().toISOString(),
    total: phoneNumbers.length,
    phoneNumbers: phoneNumbers.map(phone => ({
      number: phone.number,
      name: phone.name || 'Unknown',
      formatted: phone.formatted || phone.number
    }))
  };
  
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Saved ${phoneNumbers.length} phone numbers to ${outputPath}`);
  return data;
}

/**
 * Saves phone numbers to a CSV file
 */
export async function savePhoneNumbersToCSV(phoneNumbers, outputPath) {
  await ensureOutputDir(outputPath);
  
  const csvHeader = 'Name,Phone Number,Formatted\n';
  const csvRows = phoneNumbers.map(phone => {
    const name = (phone.name || 'Unknown').replace(/,/g, ';');
    const number = phone.number || '';
    const formatted = phone.formatted || phone.number || '';
    return `${name},${number},${formatted}`;
  }).join('\n');
  
  await fs.writeFile(outputPath, csvHeader + csvRows, 'utf-8');
  console.log(`✅ Saved ${phoneNumbers.length} phone numbers to ${outputPath}`);
}

/**
 * Saves phone numbers to a TXT file (one per line)
 */
export async function savePhoneNumbersToTXT(phoneNumbers, outputPath) {
  await ensureOutputDir(outputPath);
  
  const content = phoneNumbers.map(phone => {
    const name = phone.name ? `${phone.name}: ` : '';
    return `${name}${phone.formatted || phone.number}`;
  }).join('\n');
  
  await fs.writeFile(outputPath, content, 'utf-8');
  console.log(`✅ Saved ${phoneNumbers.length} phone numbers to ${outputPath}`);
}

/**
 * Saves phone numbers in multiple formats
 */
export async function savePhoneNumbers(phoneNumbers, baseOutputPath) {
  const basePath = baseOutputPath.replace(/\.(json|csv|txt)$/, '');
  
  // Save to Excel (creates if doesn't exist, appends if exists)
  const excelPath = await logToExcel(phoneNumbers).catch(() => null);
  
  await Promise.all([
    savePhoneNumbersToJSON(phoneNumbers, `${basePath}.json`),
    savePhoneNumbersToCSV(phoneNumbers, `${basePath}.csv`),
    savePhoneNumbersToTXT(phoneNumbers, `${basePath}.txt`)
  ]);
  
  return {
    json: `${basePath}.json`,
    csv: `${basePath}.csv`,
    txt: `${basePath}.txt`,
    excel: excelPath || 'output/phone-numbers.xlsx'
  };
}

/**
 * Formats phone number to international format
 */
export function formatPhoneNumber(number) {
  if (!number) return '';
  
  // Remove all non-digit characters
  let cleaned = number.replace(/\D/g, '');
  
  // If number doesn't start with country code, assume default (you can modify this)
  if (cleaned.length === 10) {
    // Assuming default country code (modify as needed)
    cleaned = '1' + cleaned; // Change '1' to your country code
  }
  
  // Format as +[country code][number]
  if (cleaned.length > 0 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

