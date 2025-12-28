#!/bin/bash

echo "📱 WhatsApp Phone Number Extractor - Extension Installer"
echo "=========================================================="
echo ""

# Detect browser
if command -v google-chrome &> /dev/null || command -v chromium-browser &> /dev/null; then
    BROWSER="Chrome/Chromium"
    EXT_PATH=""
elif command -v brave-browser &> /dev/null; then
    BROWSER="Brave"
    EXT_PATH=""
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -d "/Applications/Google Chrome.app" ]; then
        BROWSER="Chrome (macOS)"
        EXT_PATH="/Applications/Google Chrome.app"
    elif [ -d "/Applications/Brave Browser.app" ]; then
        BROWSER="Brave (macOS)"
        EXT_PATH="/Applications/Brave Browser.app"
    fi
fi

if [ -z "$BROWSER" ]; then
    echo "⚠️  Could not detect browser automatically"
    echo ""
    echo "Manual installation:"
    echo "1. Chrome/Edge/Brave: Go to chrome://extensions/ (or edge://extensions/)"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked'"
    echo "4. Select this folder: $(pwd)"
    echo ""
    echo "Firefox:"
    echo "1. Go to about:debugging#/runtime/this-firefox"
    echo "2. Click 'Load Temporary Add-on'"
    echo "3. Select manifest.json from this folder"
    exit 0
fi

echo "✅ Detected: $BROWSER"
echo ""
echo "📋 Installation Steps:"
echo "1. Open your browser"
echo "2. Go to:"
if [[ "$BROWSER" == *"Chrome"* ]] || [[ "$BROWSER" == *"Brave"* ]]; then
    echo "   chrome://extensions/"
elif [[ "$BROWSER" == *"Edge"* ]]; then
    echo "   edge://extensions/"
fi
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this folder:"
echo "   $(pwd)"
echo ""
echo "✨ After installation, go to web.whatsapp.com and you'll see the extractor overlay!"
echo ""

