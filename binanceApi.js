const Binance = require("node-binance-api");
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
});

async function getBinancePrice(key) {
  const binanceKey = key.toUpperCase().replaceAll("/", "");
  return new Promise((res, rej) => {
    binance.prices(binanceKey, (error, ticker) => {
      if (error) return rej(error);
      res(parseFloat(ticker[binanceKey]));
    });
  });
}

module.exports = {
  getBinancePrice,
};
