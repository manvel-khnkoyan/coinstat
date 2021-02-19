require("dotenv").config();
const { startProcess } = require("./process");
const { initializeTelegramBot } = require("./telegramBot");

/*
 * Initializing Jobs, which will periodically make a request and receive the latest updates
 * After any matching job issues a new "alert"  event, then everyone can listen and make an action
 * (for example Bot can create listener, and after any alert send a message)
 */
startProcess({
  updateInterval: process.env.CURRENCY_UPDATES_INTERVAL_MS || 3000,
});

/*
 * Start The Telegram Bot, Which can create, update, delete any alerts and users
 * - using data/users and data/currencies services
 */
initializeTelegramBot({ token: process.env.COINSTAT_TELEGRAM_BOT_TOKEN });

/*
 * Here you could set up any messenger, for example, Slack, similarly with Telegram Bot
 */
