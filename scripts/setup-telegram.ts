/**
 * Setup Telegram bot webhook and commands.
 *
 * Usage:
 *   npx tsx scripts/setup-telegram.ts
 *   APP_URL=https://dailybrew.work npx tsx scripts/setup-telegram.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
const APP_URL = process.env.APP_URL || process.env.DEFAULT_URI || '';

if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set in .env.local');
    process.exit(1);
}

if (!APP_URL || APP_URL.includes('localhost')) {
    console.error('❌ APP_URL must be a public URL (not localhost).');
    console.error('   Run: APP_URL=https://dailybrew.work npx tsx scripts/setup-telegram.ts');
    process.exit(1);
}

const webhookUrl = `${APP_URL}/api/v1/webhooks/telegram${SECRET ? `?secret=${SECRET}` : ''}`;

async function run() {
    console.log('');
    console.log('🤖 Setting up DailyBrew Telegram bot');
    console.log(`   Webhook: ${APP_URL}/api/v1/webhooks/telegram`);
    console.log('');

    // 1. Set webhook
    console.log('1. Registering webhook...');
    const whRes = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message'],
        }),
    });
    const whBody = await whRes.json();
    if (whBody.ok) {
        console.log('   ✅ Webhook registered');
    } else {
        console.error('   ❌', whBody.description);
        process.exit(1);
    }

    // 2. Set commands
    console.log('2. Setting bot commands...');
    const cmdRes = await fetch(`https://api.telegram.org/bot${TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            commands: [
                { command: 'chatid', description: "Show this chat's ID for DailyBrew" },
                { command: 'help', description: 'Show help and available commands' },
            ],
        }),
    });
    const cmdBody = await cmdRes.json();
    if (cmdBody.ok) {
        console.log('   ✅ Commands registered (/chatid, /help)');
    } else {
        console.error('   ❌', cmdBody.description);
    }

    // 3. Set bot description
    console.log('3. Setting bot description...');
    await fetch(`https://api.telegram.org/bot${TOKEN}/setMyDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description: 'Official DailyBrew notification bot for restaurant attendance alerts and reports. dailybrew.work',
        }),
    });
    console.log('   ✅ Description set');

    // 4. Verify
    console.log('4. Verifying...');
    const infoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
    const info = await infoRes.json();
    console.log(`   URL: ${info.result?.url}`);
    console.log(`   Pending updates: ${info.result?.pending_update_count ?? 0}`);

    console.log('');
    console.log('✅ Done! Bot is ready.');
    console.log('');
}

run().catch(console.error);
