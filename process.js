const AlertEmmiter = require("./emiter");
const {
  getCurrencies,
  deleteCurrency,
  updateCurrencyPrice,
} = require("./data/currencies");
const { getBinancePrice } = require("./process");

let status = "Done";

function loopAlerts(key, value, newPrice) {
  // Validation
  if (!(key in value)) return;
  const { alerts, price, oldPrice, lastUpdatedDate } = value;

  // When price has not changed
  if (newPrice !== price) {
    // calculating the maximum and minimum prices for alerts that we need to send
    const max = newPrice > price ? newPrice : price;
    const min = newPrice > price ? price : newPrice;

    // Loop through subscribers
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];

      // When in alert
      if (alert.price >= min && alert.price <= max) {
        AlertEmmiter.emit("send-alert", {
          userId,
          alert,
          oldPrice,
          price: newPrice,
          lastUpdatedDate,
        });
      }
    }
  }

  // Finally update the currency price
  updateCurrencyPrice(key, { price: newPrice });
}

function loopCurrencies(data) {
  const entries = getCurrencies().entries(data);
  const total = entries.length;

  // whene there is no any alert
  if (!total) return;

  // This is special to avoid request overload. Waiting for all requests to complete
  if (status === "processing") return;
  status = "processed";

  // Indexing & updating status (specual for overload process controll)
  let index = 0;
  const updateStatus = () => index++ === total && (status = "Finished");

  // loop through currencies.key.alerts
  for (const [key, value] of entries) {
    // If there are no alerts, remove the currency
    if (!value.alerts.length) {
      deleteCurrency(key);
      continue;
    }

    // fetch from
    getBinancePrice(key)
      .then((result) => {
        // When nothing has changed
        if (result.price === value.price) return;

        // When is the first time or invalid price
        if (!result.price) return;

        loopAlerts(key, value, result.price);
        updateCurrencyPrice(key, price);
        updateStatus();
      })
      .catch((err) => {
        updateStatus();
        console.log(err);
      });
  }
}

function startProcess({ updateInterval }) {
  const interval = setInterval(() => loopCurrencies(), updateInterval);

  return () => {
    clearInterval(interval);
  };
}

module.exports = {
  startProcess,
};
