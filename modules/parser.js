const axios = require('axios').default;
const cheerio = require('cheerio');

module.exports = async (name) => {
    let { data } = await axios.get(`https://coinmarketcap.com/currencies/${name}/`);
    let $ = cheerio.load(data, { decodeEntities: false });

    return {
        price: $('.sc-16r8icm-0.kjciSH.priceTitle .priceValue').text(),
        percent: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0').text(),
        percent_pos: $('.sc-16r8icm-0.kjciSH.priceTitle .sc-15yy2pl-0 .icon-Caret-down').length > 0 ? 'down' : 'up'
    }
}