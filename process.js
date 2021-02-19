const AlertEmmiter = require("./emiter");

const {
  getCurrencies,
  deleteCurrency,
  updateCurrencyPrice,
} = require("./data/currencies");
const { getBinancePrice } = require("./binanceApi");

let status = "Done";

function loopAlerts(currencyKey, currencyValue, newPrice) {
  // Currency Values
  const oldPrice = currencyValue.price;
  const currencyAlerts = currencyValue.alerts;
  const lastUpdatedDate = currencyValue.lastUpdatedDate;

  // When price has not changed
  if (newPrice !== oldPrice) {
    // calculating the maximum and minimum prices for alerts that we need to send
    const max = newPrice > oldPrice ? newPrice : oldPrice;
    const min = newPrice < oldPrice ? newPrice : oldPrice;

    // Loop through subscribers
    for (let i = 0; i < currencyAlerts.length; i++) {
      const alert = currencyAlerts[i];
      const userId = alert.userId;
      const setPrice = alert.price;

      // When in alert
      if (setPrice >= min && setPrice <= max) {
        AlertEmmiter.emit("alert", {
          userId,
          currency: currencyKey,
          setPrice: setPrice,
          oldPrice: oldPrice,
          newPrice: newPrice,
          lastUpdatedDate,
        });
      }
    }
  }

  // Finally update the currency price
  updateCurrencyPrice(currencyKey, { price: newPrice });
}

function loopCurrencies() {
  const entries = Object.entries(getCurrencies());
  const total = entries.length;

  // whene there is no any alert
  if (!total) return;

  // This is special to avoid request overload. Waiting for all requests to complete
  if (status === "processing") return;
  status = "processed";

  // Indexing & updating status (specual for overload process controll)
  let index = 0;
  const updateStatus = () => index++ >= total && (status = "Finished");

  // loop through currencies.key.alerts
  for (const [key, value] of entries) {
    // If there are no alerts, remove the currency
    if (!value.alerts.length) {
      deleteCurrency(key);
      continue;
    }

    // fetch from
    getBinancePrice(key)
      .then((newPrice) => {
        // When nothing has changed
        if (newPrice === value.price) return;

        // When is the first time or invalid price
        if (value.price) {
          loopAlerts(key, value, newPrice);
        }

        // then update new price
        updateCurrencyPrice(key, newPrice);

        // change status when finished
        updateStatus();
      })
      .catch((err) => {
        updateStatus();
        console.log(err.message);
      });
  }
}

function startProcess({ updateInterval }) {
  const interval = setInterval(() => loopCurrencies(), updateInterval);
  console.log(`Process started with ${updateInterval} MS interval updates`);

  return () => {
    clearInterval(interval);
  };
}

module.exports = {
  startProcess,
};
