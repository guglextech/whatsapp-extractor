/**
 * Validates if a string is a valid phone number
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Phone numbers should be between 7 and 15 digits (international standard)
  return cleaned.length >= 7 && cleaned.length <= 15;
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
 * Normalizes phone number format
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a WhatsApp ID format (e.g., 1234567890@c.us), extract the number
  if (phone.includes('@c.us')) {
    cleaned = phone.split('@')[0];
  }
  
  return cleaned;
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

