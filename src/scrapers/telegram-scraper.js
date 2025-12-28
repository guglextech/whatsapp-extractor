import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import readline from 'readline';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { savePhoneNumbers } from '../utils/fileHandler.js';
import { normalizePhoneNumber, deduplicatePhoneNumbers } from '../utils/phoneUtils.js';

dotenv.config();

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0');
const API_HASH = process.env.TELEGRAM_API_HASH || '';
const SESSION_FILE = process.env.TELEGRAM_SESSION_FILE || 'sessions/telegram.session';
const CHANNEL_USERNAME = process.env.TELEGRAM_CHANNEL_USERNAME || '';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'output/phone-numbers.json';

/**
 * Helper function to get user input
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Simple Telegram channel phone number scraper
 * Uses Telegram Client API (MTProto) via GramJS
 */
async function scrapePhoneNumbers() {
  console.log('🚀 Starting Telegram Channel Scraper...\n');

  if (!API_ID || !API_HASH) {
    console.error('❌ Error: TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env file');
    console.log('\nTo get your API credentials:');
    console.log('1. Go to https://my.telegram.org/apps');
    console.log('2. Create an application');
    console.log('3. Copy API ID and API Hash to your .env file\n');
    process.exit(1);
  }

  if (!CHANNEL_USERNAME) {
    console.error('❌ Error: TELEGRAM_CHANNEL_USERNAME not set in .env file');
    console.log('Set TELEGRAM_CHANNEL_USERNAME to the channel username (without @)');
    process.exit(1);
  }

  // Load or create session
  let sessionString = '';
  try {
    sessionString = await fs.readFile(SESSION_FILE, 'utf-8');
  } catch (error) {
    // Session file doesn't exist, will create new session
  }

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  try {
    console.log('🔐 Connecting to Telegram...\n');
    await client.connect();

    if (!(await client.checkAuthorization())) {
      console.log('📱 Authentication required\n');
      
      const phoneNumber = await askQuestion('Enter your phone number (with country code): ');
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, phoneNumber);
      
      const code = await askQuestion('Enter the code you received: ');
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber,
          phoneCodeHash,
          phoneCode: code,
        })
      );
    }

    console.log('✅ Successfully authenticated!\n');

    // Save session for future use
    const newSession = client.session.save();
    await fs.mkdir('sessions', { recursive: true });
    await fs.writeFile(SESSION_FILE, newSession, 'utf-8');

    console.log(`🔍 Searching for channel: @${CHANNEL_USERNAME}\n`);

    // Get channel entity
    const channel = await client.getEntity(CHANNEL_USERNAME);
    
    if (!channel) {
      console.error(`❌ Channel @${CHANNEL_USERNAME} not found`);
      process.exit(1);
    }

    console.log(`✅ Found channel: ${channel.title || CHANNEL_USERNAME}\n`);
    console.log('📊 Fetching channel members...\n');

    // Get all participants
    const participants = [];
    let offset = 0;
    const limit = 200;

    try {
      while (true) {
        const result = await client.invoke(
          new Api.channels.GetParticipants({
            channel: channel,
            filter: new Api.ChannelParticipantsRecent(),
            offset: offset,
            limit: limit,
            hash: BigInt(0),
          })
        );

        if (!result.users || result.users.length === 0) break;

        for (const user of result.users) {
          if (user instanceof Api.User && user.phone) {
            participants.push({
              id: user.id.toString(),
              phone: user.phone,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              username: user.username || '',
            });
          }
        }

        process.stdout.write(`\r📥 Fetched: ${participants.length} members...`);

        if (result.users.length < limit) break;
        offset += limit;
      }
    } catch (error) {
      if (error.message.includes('CHAT_ADMIN_REQUIRED')) {
        console.error('\n❌ Error: You need to be an admin of the channel to view members');
        console.log('   Or the channel may have privacy restrictions');
      } else {
        throw error;
      }
    }

    console.log(`\n\n✅ Found ${participants.length} members with phone numbers\n`);

    if (participants.length === 0) {
      console.log('⚠️  No phone numbers found. Members may have hidden their phone numbers.');
      await client.disconnect();
      process.exit(0);
    }

    // Process phone numbers
    const phoneNumbers = participants.map(participant => {
      const number = normalizePhoneNumber(participant.phone);
      const name = [participant.firstName, participant.lastName]
        .filter(Boolean)
        .join(' ') || participant.username || 'Unknown';

      return {
        number: number,
        name: name,
        formatted: number ? `+${number}` : '',
        username: participant.username || '',
      };
    }).filter(p => p.number);

    console.log('🔄 Deduplicating phone numbers...');
    const uniquePhoneNumbers = deduplicatePhoneNumbers(phoneNumbers);

    console.log(`\n✅ Extracted ${uniquePhoneNumbers.length} unique phone numbers\n`);

    // Save to files
    console.log('💾 Saving phone numbers to files...\n');
    await savePhoneNumbers(uniquePhoneNumbers, OUTPUT_FILE);

    console.log('\n✨ Scraping completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during scraping:', error.message);
    
    if (error.message.includes('FLOOD_WAIT')) {
      console.log('\n💡 Telegram rate limit reached. Please wait and try again later.');
    } else if (error.message.includes('USERNAME_NOT_OCCUPIED')) {
      console.log(`\n💡 Channel @${CHANNEL_USERNAME} does not exist or is not accessible.`);
    }
  } finally {
    await client.disconnect();
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Process interrupted. Cleaning up...');
  process.exit(0);
});

// Run the scraper
scrapePhoneNumbers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

