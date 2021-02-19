const { createCurrencyAlert, deleteUserAlerts } = require("./currencies");

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
    if (UsersDB.alerts.find(findMe)) {
      return;
    }

    UsersDB.alerts.push({ currency, price });
    createCurrencyAlert(currency, userId, price);
  }
}

/**
 * Delete User Aaerts
 * @param {Object} data
 * @returns {Object}
 */
function deleteUserAlerts(userId, currency, price) {
  const index = getIndex(userId);
  if (index in UsersDB) {
    UsersDB.alerts = UsersDB.alerts.filter((item) => {
      if (currency !== item.currency || currency !== "*") return true;
      if (price !== item.price || price !== "*") return true;
      return false;
    });
    deleteUserAlerts(currency, userId, price);
  }
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
    const { currency, price } = alert;
    deleteUserAlerts(currency, user.id, price);
  });
  UsersDB[getIndex(id)] = null;
  return false;
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
 * Find User By Chat Id
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
  findUser,
  getUser,
};
