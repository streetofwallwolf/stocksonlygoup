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

    res.render('index', {title: symbol, price, symbol});
});

router.get('/stocks/streaming/:symbol', (req, res) => {
    const {symbol} = req.params;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    const interval = setInterval(async () => {
        const price = await getStockPrice(symbol);
        prices[symbol] = price;
        res.write("id: " + Date.now() + "\ndata: " + JSON.stringify({price, symbol}) + "\n\n");
    }, 1000);

    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

module.exports = router;
