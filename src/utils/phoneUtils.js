/**
 * Validates if a string is a valid Ghana phone number
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Ghana phone number validation
  // Format: +233XXXXXXXXX (12 digits with country code) or 233XXXXXXXXX
  // Or local format: 0XXXXXXXXX (10 digits starting with 0)
  // Mobile prefixes: 20, 24, 26, 27, 50, 54, 55, 56, 57, 59
  
  // Check if it's a Ghana number with country code
  if (cleaned.startsWith('233')) {
    // Should be 12 digits total (233 + 9 digits)
    if (cleaned.length === 12) {
      const mobilePrefix = cleaned.substring(3, 5); // Get first 2 digits after 233
      const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
      return validPrefixes.includes(mobilePrefix);
    }
  }
  
  // Check if it's a local Ghana number (starts with 0)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    const mobilePrefix = cleaned.substring(1, 3); // Get first 2 digits after 0
    const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
    return validPrefixes.includes(mobilePrefix);
  }
  
  // Check if it's 9 digits (without country code or leading 0)
  if (cleaned.length === 9) {
    const mobilePrefix = cleaned.substring(0, 2);
    const validPrefixes = ['20', '24', '26', '27', '50', '54', '55', '56', '57', '59'];
    return validPrefixes.includes(mobilePrefix);
  }
  
  return false;
}

/**
 * Extracts phone numbers from text
 */
export function extractPhoneNumbers(text) {
  if (!text) return [];
  
  // Multiple regex patterns to catch different phone number formats
  const patterns = [
    /\+\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/g, // +1234567890
    /\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/g, // 123-456-7890
    /\d{10,15}/g, // 1234567890 (10-15 digits)
    /\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}/g, // (123) 456-7890
  ];
  
  const phoneNumbers = new Set();
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (isValidPhoneNumber(match)) {
          phoneNumbers.add(match.replace(/\D/g, ''));
        }
      });
    }
  });
  
  return Array.from(phoneNumbers);
}

/**
 * Normalizes phone number format to Ghana standard (233XXXXXXXXX)
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a WhatsApp ID format (e.g., 1234567890@c.us), extract the number
  if (phone.includes('@c.us')) {
    cleaned = phone.split('@')[0].replace(/\D/g, '');
  }
  
  // Normalize to Ghana format: 233XXXXXXXXX (12 digits)
  if (cleaned.startsWith('233')) {
    // Already has country code, ensure it's 12 digits
    if (cleaned.length === 12) {
      return cleaned;
    }
    // If longer, truncate to 12
    if (cleaned.length > 12) {
      return cleaned.substring(0, 12);
    }
  } else if (cleaned.startsWith('0')) {
    // Local format: 0XXXXXXXXX -> convert to 233XXXXXXXXX
    if (cleaned.length === 10) {
      return '233' + cleaned.substring(1);
    }
  } else if (cleaned.length === 9) {
    // 9 digits without prefix -> add 233
    return '233' + cleaned;
  }
  
  // If it doesn't match Ghana format, return empty
  return '';
}

/**
 * Deduplicates phone numbers array
 */
export function deduplicatePhoneNumbers(phoneNumbers) {
  const seen = new Set();
  const unique = [];
  
  phoneNumbers.forEach(phone => {
    const normalized = normalizePhoneNumber(phone.number || phone);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      unique.push(typeof phone === 'string' ? { number: normalized } : phone);
    }
  });
  
  return unique;
}

