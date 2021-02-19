const { createCurrencyAlert, deleteCurrencyAlerts } = require("./currencies");

/*
 * Template is something like this:
 *  const users = [
 *    { id: 1, data: {telegramChatId: '2414'}, alerts: [{currency: 'BTC/USDT', price: 28.58}, ...] },
 *    { id: 1, data: {slackUserId: '95815'}, ...},
 *    ...
 *  ];
 */
const UsersDB = [];

/**
 * Create Index By given Id
 * @param {Number} data
 */
function getIndex(id) {
  return (index = id - 1);
}

/**
 * Create User
 * @param {Object} data
 * @returns {Object}
 */
function createUser(data) {
  const id = UsersDB.length + 1;

  const user = { id, data, alerts: [] };
  UsersDB.push(user);
  return user;
}

/**
 * Create User Alerts
 * @param {String} userId
 * @param {String} currency
 * @param {Number} price
 * @returns {Object}
 */
function createUserAlert(userId, currency, price) {
  const index = getIndex(userId);
  if (index in UsersDB) {
    // Check If Already Exist
    const findMe = (item) => item.currency === currency && item.price === price;
    if (UsersDB[index].alerts.find(findMe)) {
      return false;
    }

    UsersDB[index].alerts.push({ currency, price });
    createCurrencyAlert(currency, userId, price);
    return true;
  }
}

/**
 * Delete User Aaerts
 * @param {Object} data
 * @returns {Object}
 */
function deleteUserAlerts(userId, currency, price = "*") {
  const index = getIndex(userId);

  // Find All Users Currencies
  const currencies =
    currency === "*"
      ? [...new Set(UsersDB[index].alerts.map((item) => item.currency))]
      : [currency];

  if (index in UsersDB) {
    const total = UsersDB[index].alerts.length;
    // Delete Currency User Alerts
    currencies.forEach((key) => deleteCurrencyAlerts(key, userId, price));

    // Delete User Alerts
    UsersDB[index].alerts = UsersDB[index].alerts.filter((item) => {
      if (currency === "*") return false;
      if (currency !== item.currency) return true;
      if (price === "*") return false;
      if (price !== item.price) return true;
    });
    return total !== UsersDB[index].alerts.length;
  }
  return false;
}

/**
 * Delete User
 * @param {Number} id
 * @param {Boolean}
 */
function deleteUser(id) {
  if (isNaN(id)) return false;

  const user = getUser(id);
  if (!user) return;

  user.alerts.forEach((alert) => {
    const { currency } = alert;
    deleteUserAlerts(user.id, currency, "*");
  });
  UsersDB[getIndex(id)] = null;
  return true;
}

/**
 * Get User
 * @param {Number} id
 * @param {Object}
 */
function getUser(id) {
  if (!Number.isInteger(id)) return false;
  const index = getIndex(id);
  return index in UsersDB && UsersDB[index];
}

/**
 * Find User By given function
 * @param {Function} fn
 * @param {Object}
 */
function findUser(fn) {
  if (typeof fn !== "function") {
    return null;
  }
  return UsersDB.find(fn);
}

module.exports = {
  createUser,
  deleteUser,
  createUserAlert,
  deleteUserAlerts,
  findUser,
  getUser,
};
