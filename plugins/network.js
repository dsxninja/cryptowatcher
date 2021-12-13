const axios = require('axios').default;
const cheerio = require('cheerio');

module.exports = class NetWork {
    constructor() {
        this.method = 'binance';
    }

    async parser(name) {
        let { data } = await axios.get(`https://coinmarketcap.com/currencies/${name}/`),
            $ = cheerio.load(data, { decodeEntities: false });
    
        return {
            price: $('.sc-16r8icm-0.kjciSH.priceTitle .priceValue').text(),
            percent: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0').text(),
            percent_pos: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0 .icon-Caret-down').length > 0 ? 'down' : 'up'
        }
    }

    async binance(name, currency = 'USDT') {
        return axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${name.toUpperCase()}${currency}`).then(({ data }) => {
            return {
                // name: alias[name],
                reduction: name,
                price: Number(data.lastPrice).toFixed(2),
                percent: Number(data.priceChangePercent).toFixed(2),
                priceChange: Number(data.priceChange).toFixed(2),
                currency
            }
        }).catch(() => {
            return { code: 400 }
        });
    }

    async getPrice(name, currency) {
        return {
            method: this.method,
            data: await this[this.method](name, currency)
        }
    }
}