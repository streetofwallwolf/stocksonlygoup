var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

const prices = {};

const getStockPrice = async (symbol) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${symbol}+stock`, {waitUntil: 'domcontentloaded'});
    const evaluate = await page.evaluate(
        () => {
            const element = document.querySelector("g-card-section > span");
            if (element) {
                return element.textContent;
            }
        }
    );
    await browser.close();
    return evaluate;
}

/* GET home page. */
router.get('/stocks/:symbol', async function (req, res, next) {
    const {symbol} = req.params;

    let price = prices[symbol];
    if (price === undefined) {
        prices[symbol] = await getStockPrice(symbol);
        price = prices[symbol];
    }

    res.send({price, symbol});
});

setInterval(() => {
    Object.keys(prices).forEach(async (symbol) => {
        prices[symbol] = await getStockPrice(symbol);
    });
}, 1000 * 60);

module.exports = router;
