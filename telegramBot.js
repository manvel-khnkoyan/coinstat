// Create a bot that uses 'polling' to fetch new updates
function initializeTelegramBot({ token }) {
  const bot = new TelegramBot(token, { polling: true });

  // Matches "/echo [whatever]"
  bot.onText(/.*/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[0];

    const createMatch = text.match(
      "/alerts ([a-zA-Z/]+) ((?:[1-9]*)|(?:(?:[1-9]*).(?:[0-9]*)))"
    );
    if (createMatch) {
      const key = createMatch[1].toUpperCase();
      const currency = parseFloat(createMatch[2]);

      bot.sendMessage(
        chatId,
        `Thank you. You just now set a new ${key} alert at ${currency}`
      );
      return;
    }

    const deleteMatch = text.match("/alerts (-(?:0|[1-9][0-9]*))");
    if (deleteMatch) {
      const index = parseInt(deleteMatch[1]);
      bot.sendMessage(chatId, `Thank you. You just now deleted ${index} alert`);
      return;
    }

    const message =
      "Please follow the templates below:\n" +
      "<b>/alerts</b> to see all your alerts\n" +
      "<b>/alerts add BTC/ETH 26.88</b> to set alert\n" +
      "<b>/alerts del BTC/ETH 26.88</b> to delete alert";

    bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  });

  bot.on("polling_error", console.log);
}

module.exports = {
  initializeTelegramBot,
};
