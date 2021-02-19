require("dotenv").config();
const { startProcess } = require("./process");
const { initializeTelegramBot } = require("./telegramBot");

/*
 * Initializing
 */
startProcess({ updateInterval: process.CURRENCY_UPDATES_INTERVAL_MS || 3000 });

/*
Start The Telegram Bot
*/
initializeTelegramBot({ token: process.TELEGRAM_BOT_TOKEN });
