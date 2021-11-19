const axios = require('axios').default;
const cheerio = require('cheerio');

let alias = {
    ltc: 'litecoin',
    btc: 'bitcoin',
    aave: 'aave'
}

module.exports.parser = async name => {
    let { data } = await axios.get(`https://coinmarketcap.com/currencies/${name}/`);
    let $ = cheerio.load(data, { decodeEntities: false });

    return {
        price: $('.sc-16r8icm-0.kjciSH.priceTitle .priceValue').text(),
        percent: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0').text(),
        percent_pos: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0 .icon-Caret-down').length > 0 ? 'down' : 'up'
    }
}

module.exports.binance = async (name, currency = 'USDT') => {
    // let _a = Object.entries(alias).filter(f => f[1] === name)[0];

    // if (alias[name] || _a) name = alias[name] || _a[0];
    //     else return { message: `Мы не смогли найти ${name} :{` };

    // let { data, status } = await
    return axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${name.toUpperCase()}${currency}`).then(({ data }) => {
        return {
            name: alias[name],
            reduction: name,
            price: Number(data.lastPrice).toFixed(2),
            percent: Number(data.priceChangePercent).toFixed(2),
            priceChange: Number(data.priceChange).toFixed(2),
            currency
        }
    }).catch(() => {
        return { message: `Мы не смогли найти ${name} :{`, code: 400 }
    })
}