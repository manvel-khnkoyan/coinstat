const TelegramBot = require("node-telegram-bot-api");
const AlertEmmiter = require("./emiter");

const {
  getUser,
  findUser,
  createUser,
  createUserAlert,
  deleteUserAlerts,
} = require("./data/users");
const { currencyList } = require("./data/currencyList");
const currencies = require("./data/currencies");
const users = require("./data/users");
const options = { parse_mode: "Markdown" };

// Create a bot that uses 'polling' to fetch new updates
function initializeTelegramBot({ token }) {
  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram Bot started");

  // Matches "/echo [whatever]"
  bot.onText(/.*/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[0];
    console.log(`Initalized new Text, chatId ${chatId}, message: ${text}`);

    /*
     * Create New User,
     * Here we can create a map by chatId to efficiently find the user.
     */
    let isNewUser = false;
    const user =
      findUser((item) => item.data.chatId === chatId) ||
      ((isNewUser = 1) && createUser({ chatId }));
    if (isNewUser) {
      console.log(`Connected new user ${user}`);
    }

    /*
     * On Show List
     */
    const lsMatch = text.match("/ls");
    if (lsMatch) {
      const message = user.alerts.length
        ? "Your alerts: \n" +
          user.alerts
            .map((item) => `\*${item.currency} : ${item.price}\*`)
            .join("\n")
        : "Oops. You don't have any alert yet. Please type /help form more information";

      return bot.sendMessage(chatId, message, options);
    }

    /*
     * On New Alert
     */
    const createMatch = text.match(
      "/add ([a-zA-Z]+) ((?:[1-9]*)|(?:(?:[1-9]*).(?:[0-9]*)))$"
    );
    if (createMatch) {
      const currency = createMatch[1].toUpperCase();
      const price = parseFloat(createMatch[2]);

      if (currencyList.findIndex((item) => item === currency) < 0) {
        return bot.sendMessage(
          chatId,
          `Oops, The given currency does not exist \*${currency}\* :( Try another one.`,
          options
        );
      }

      const result = createUserAlert(user.id, currency, parseFloat(price));
      if (!result) {
        return bot.sendMessage(
          chatId,
          `Oops, Probably you have already seen this alert: \*${currency} : ${price}\*`,
          options
        );
      }

      return bot.sendMessage(
        chatId,
        `OK. You set: \*${currency} : ${price}\*`,
        options
      );
    }

    /*
     * On Deletes
     */

    const deleteSpecMatch = text.match("/del ([a-zA-Z]+) (\\*|[1-9][0-9]*)$");
    if (deleteSpecMatch) {
      const currency = deleteSpecMatch[1].toUpperCase();
      const price =
        deleteSpecMatch[2] === "*"
          ? deleteSpecMatch[2]
          : parseFloat(deleteSpecMatch[2]);

      if (currencyList.findIndex((item) => item === currency) < 0) {
        return bot.sendMessage(
          chatId,
          `Oops, The given currency does not exist \*${currency}\* :( Try agin`,
          options
        );
      }

      const res = deleteUserAlerts(user.id, currency, price);
      if (!res)
        return bot.sendMessage(
          chatId,
          `Oops. Did not match to any alerts :(`,
          options
        );

      return bot.sendMessage(
        chatId,
        `OK. Deleted \*${currency} : ${price}\*`,
        options
      );
    }

    const deleteAllMatch = text.match("/del \\*");
    if (deleteAllMatch) {
      const res = deleteUserAlerts(user.id, "*");
      if (!res)
        return bot.sendMessage(
          chatId,
          `Oops. Did not match to any alerts :(`,
          options
        );

      return bot.sendMessage(chatId, `OK. Deleted all your alerts`, options);
    }

    const helpMatch = text.match("/help");
    if (helpMatch) {
      const message =
        "Please follow the templates below:\n" +
        '*"/ ls"* to see all your alerts\n' +
        '*"/ add BTCUSDT 12.88"* set alert\n' +
        '*"/ del BTCUSDT 12.88"* delete one\n' +
        '*"/ del BTCUSDT"* delete bunch\n' +
        '*"/ del "* delete all alerts\n';

      bot.sendMessage(chatId, message, options);
      return;
    }

    bot.sendMessage(chatId, "Please enter /help for options", options);
  });

  bot.on("polling_error", console.log);

  // Initialize Event Emitter
  AlertEmmiter.on(
    "alert",
    ({ currency, newPrice, setPrice, oldPrice, userId }) => {
      const user = getUser(userId);
      const diff = newPrice - oldPrice;

      if (user && user.data.chatId) {
        const message = `Notice: \*${currency} : ${setPrice}\* just hit ${
          diff > 0 ? "up \n+" : "down\n"
        }${diff}\nLast: ${oldPrice}, Current: ${newPrice}`;
        bot.sendMessage(user.data.chatId, message, options);
        console.log(`${message} [${userId}]`);
      }
    }
  );
}

module.exports = {
  initializeTelegramBot,
};
