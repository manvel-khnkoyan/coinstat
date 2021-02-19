/*
 * The common view of data currencies
 *
 * const currencies = {
 *   'BTC/USDT': {
 *       lastUpdatedDate: new Date(),
 *       oldPrice: 156.154,
 *       price: 156.156,
 *       alerts: [
 *           {userId: 15, price: 170}
 *       ]
 *   },
 *   ...
 * };
 */
const CurrenciesDB = {};

/**
 * Get all currencies
 * @returns {Object}
 */
function getCurrencies() {
  return CurrenciesDB;
}

/**
 * Create New Currency
 * @param {String} currency
 * @returns {Object}
 */
function createCurrency(currency) {
  if (currency in CurrenciesDB) return false;
  CurrenciesDB[currency] = {
    lastUpdatedDate: new Date(),
    oldPrice: 0,
    price: 0,
    alerts: [],
  };
  return true;
}

/**
 * Create New Currency
 * @param {String} currency
 * @returns {Object}
 */
function updateCurrencyPrice(currency, price) {
  if (currency in CurrenciesDB) return false;

  CurrenciesDB[currency].lastUpdatedDate = new Date();
  CurrenciesDB[currency].oldPrice = CurrenciesDB[currency].price;
  CurrenciesDB[currency].price = price;

  return true;
}

/**
 * Delete Currency
 * @param {String} currency
 * @returns {Object}
 */
function deleteCurrency(currency) {
  if (!(currency in CurrenciesDB)) return false;
  if (CurrenciesDB[currency].alerts.length) return false;
  delete CurrenciesDB[currency];
  return true;
}

/**
 * Adding New Subscription
 * @param {String} currency
 * @param {String} userId
 * @param {Number} price
 * @returns {String}
 */
function createCurrencyAlert(currency, userId, price) {
  const user = getUser(userId);
  if (!user) return;

  if (!(currency in CurrenciesDB)) {
    createCurrency(currency);
  }

  // Add Into Storage
  CurrenciesDB.alerts.push({ userId, price });
  CurrenciesDB.alerts = CurrenciesDB.alerts.sort((a, b) => a.price - b.price);
  return true;
}

/**
 * Adding New Subscription
 * @param {String} currency
 * @param {String} userId
 * @param {Number} price
 * @returns {String}
 */
function deleteCurrencyAlerts(currency, userId, price) {
  const user = getUser(userId);
  if (!user) return;
  if (!(currency in CurrenciesDB)) {
    return;
  }

  CurrenciesDB.alerts = CurrenciesDB.alerts.filter((item) => {
    if (userId !== item.userId || userId !== "*") return true;
    if (price !== item.price || price !== "*") return true;
    return false;
  });
}

module.exports = {
  getCurrencies,
  createCurrency,
  deleteCurrency,
  updateCurrencyPrice,
  createCurrencyAlert,
  deleteCurrencyAlerts,
};
