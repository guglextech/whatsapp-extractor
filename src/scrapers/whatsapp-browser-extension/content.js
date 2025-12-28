/**
 * WhatsApp Web Phone Number Extractor - Browser Extension Content Script
 * 
 * This script runs on WhatsApp Web and extracts phone numbers from the group members list
 * as you scroll through it.
 */

(function() {
  'use strict';

  const extractedNumbers = new Set();
  let isMonitoring = false;
  let lastCount = 0;

  // Create UI overlay
  function createUI() {
    const overlay = document.createElement('div');
    overlay.id = 'phone-extractor-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: #25D366;
      color: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>📱 Phone Extractor</strong>
        <button id="extractor-toggle" style="background: white; color: #25D366; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          Start
        </button>
      </div>
      <div id="extractor-stats" style="margin-bottom: 10px;">
        <div>Extracted: <strong id="extractor-count">0</strong> numbers</div>
      </div>
      <div style="display: flex; gap: 5px;">
        <button id="extractor-save" style="flex: 1; background: white; color: #25D366; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          💾 Save
        </button>
        <button id="extractor-copy" style="flex: 1; background: white; color: #25D366; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          📋 Copy
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Toggle monitoring
    document.getElementById('extractor-toggle').addEventListener('click', () => {
      isMonitoring = !isMonitoring;
      document.getElementById('extractor-toggle').textContent = isMonitoring ? 'Stop' : 'Start';
      overlay.style.background = isMonitoring ? '#25D366' : '#999';
      
      if (isMonitoring) {
        console.log('📱 Phone extraction started');
      } else {
        console.log('⏹️ Phone extraction stopped');
      }
    });

    // Save numbers
    document.getElementById('extractor-save').addEventListener('click', () => {
      saveNumbers();
    });

    // Copy numbers
    document.getElementById('extractor-copy').addEventListener('click', () => {
      copyNumbers();
    });
  }

  // Extract phone numbers from visible elements
  function extractPhoneNumbers() {
    if (!isMonitoring) return;

    const phoneRegex = /\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
    const numbers = [];

    // Look for phone numbers in various elements
    const selectors = [
      '[data-testid="cell-frame-container"]',
      '[role="listitem"]',
      'span[title*="+"]',
      'div[title*="+"]',
      'span',
      'div'
    ];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Check text content
          const text = el.textContent || el.innerText || '';
          const matches = text.match(phoneRegex);
          
          if (matches) {
            matches.forEach(match => {
              const cleaned = match.replace(/\D/g, '');
              if (cleaned.length >= 7 && cleaned.length <= 15) {
                // Try to get name
                const nameEl = el.querySelector('span[title]') || 
                              el.closest('[data-testid]')?.querySelector('span[title]');
                const name = nameEl?.getAttribute('title')?.replace(phoneRegex, '').trim() || 
                           text.replace(phoneRegex, '').trim().substring(0, 50) || 
                           'Unknown';
                
                numbers.push({
                  number: cleaned,
                  name: name,
                  formatted: `+${cleaned}`
                });
              }
            });
          }

          // Check title attribute
          const title = el.getAttribute('title');
          if (title) {
            const titleMatches = title.match(phoneRegex);
            if (titleMatches) {
              titleMatches.forEach(match => {
                const cleaned = match.replace(/\D/g, '');
                if (cleaned.length >= 7 && cleaned.length <= 15) {
                  numbers.push({
                    number: cleaned,
                    name: title.replace(phoneRegex, '').trim() || 'Unknown',
                    formatted: `+${cleaned}`
                  });
                }
              });
            }
          }
        });
      } catch (e) {
        // Ignore errors
      }
    });

    // Add to set (deduplicate)
    numbers.forEach(phone => {
      extractedNumbers.add(JSON.stringify(phone));
    });

    // Update UI
    const currentCount = extractedNumbers.size;
    if (currentCount > lastCount) {
      document.getElementById('extractor-count').textContent = currentCount;
      lastCount = currentCount;
    }
  }

  // Save numbers to file
  function saveNumbers() {
    const numbersArray = Array.from(extractedNumbers).map(str => JSON.parse(str));
    
    const data = {
      timestamp: new Date().toISOString(),
      total: numbersArray.length,
      phoneNumbers: numbersArray
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-phone-numbers-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Also create CSV
    const csv = 'Name,Phone Number,Formatted\n' + 
                numbersArray.map(p => 
                  `"${(p.name || 'Unknown').replace(/"/g, '')}","${p.number}","${p.formatted}"`
                ).join('\n');
    
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvA = document.createElement('a');
    csvA.href = csvUrl;
    csvA.download = `whatsapp-phone-numbers-${Date.now()}.csv`;
    csvA.click();
    URL.revokeObjectURL(csvUrl);

    alert(`✅ Saved ${numbersArray.length} phone numbers!`);
  }

  // Copy numbers to clipboard
  function copyNumbers() {
    const numbersArray = Array.from(extractedNumbers).map(str => JSON.parse(str));
    const text = numbersArray.map(p => `${p.name}: ${p.formatted}`).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ Copied ${numbersArray.length} phone numbers to clipboard!`);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert(`✅ Copied ${numbersArray.length} phone numbers to clipboard!`);
    });
  }

  // Monitor scroll and extract
  function startMonitoring() {
    // Extract on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        extractPhoneNumbers();
      }, 500);
    }, true);

    // Extract periodically
    setInterval(() => {
      extractPhoneNumbers();
    }, 2000);

    // Extract on DOM changes (new members loaded)
    const observer = new MutationObserver(() => {
      extractPhoneNumbers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createUI();
      startMonitoring();
    });
  } else {
    createUI();
    startMonitoring();
  }
})();

