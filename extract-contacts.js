import fs from 'fs/promises';
import path from 'path';
import XLSX from 'xlsx';
import { normalizePhoneNumber, isValidPhoneNumber, extractPhoneNumbers as extractPhones } from './src/utils/phoneUtils.js';

const CONTACT_FILE = path.join(process.cwd(), 'output', 'contact.txt');
const OUTPUT_FILE = path.join(process.cwd(), 'output', 'contacts.xlsx');

async function extractPhoneNumbers() {
  try {
    console.log('📖 Reading contact.txt file...');
    const content = await fs.readFile(CONTACT_FILE, 'utf-8');
    
    console.log('🔍 Extracting phone numbers...');
    const lines = content.split('\n');
    const phoneNumbers = new Set();
    
    // Process each line
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Method 1: Extract using regex patterns (handles all formats)
      const extracted = extractPhones(trimmed);
      extracted.forEach(phone => {
        const normalized = normalizePhoneNumber(phone);
        if (normalized && isValidPhoneNumber(normalized)) {
          phoneNumbers.add(normalized);
        }
      });
      
      // Method 2: Handle timestamp format: [timestamp] name: +phone
      const timestampMatch = trimmed.match(/\[.*?\]\s*.*?:\s*([+]?\d[\d\s\-\(\)]+)/);
      if (timestampMatch) {
        const phone = timestampMatch[1];
        const normalized = normalizePhoneNumber(phone);
        if (normalized && isValidPhoneNumber(normalized)) {
          phoneNumbers.add(normalized);
        }
      }
      
      // Method 3: Handle simple line with phone number
      // Check if line is mostly a phone number (starts with + or digits)
      if (/^[\s]*[+]?\d/.test(trimmed)) {
        // Extract all potential phone numbers from the line
        const phonePatterns = [
          /\+?\d{10,15}/g,  // 10-15 digit numbers with optional +
          /\+?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g, // Formatted numbers
        ];
        
        phonePatterns.forEach(pattern => {
          const matches = trimmed.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const normalized = normalizePhoneNumber(match);
              if (normalized && isValidPhoneNumber(normalized)) {
                phoneNumbers.add(normalized);
              }
            });
          }
        });
      }
    }
    
    console.log(`✅ Found ${phoneNumbers.size} unique phone numbers`);
    
    // Convert to array and format for Excel
    const phoneArray = Array.from(phoneNumbers).map(number => ({
      'Phone Number': number,
      'Formatted': '+' + number,
      'Date Extracted': new Date().toISOString()
    }));
    
    // Sort by phone number
    phoneArray.sort((a, b) => a['Phone Number'].localeCompare(b['Phone Number']));
    
    // Create Excel workbook
    console.log('📊 Creating Excel file...');
    const worksheet = XLSX.utils.json_to_sheet(phoneArray);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Phone Number
      { wch: 20 }, // Formatted
      { wch: 25 }  // Date Extracted
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    
    // Write file
    XLSX.writeFile(workbook, OUTPUT_FILE);
    
    console.log(`✅ Successfully extracted ${phoneArray.length} phone numbers`);
    console.log(`📁 Saved to: ${OUTPUT_FILE}`);
    
    return OUTPUT_FILE;
  } catch (error) {
    console.error('❌ Error extracting phone numbers:', error.message);
    throw error;
  }
}

// Run the extraction
extractPhoneNumbers().catch(console.error);

