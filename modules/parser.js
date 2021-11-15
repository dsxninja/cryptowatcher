const axios = require('axios').default;
const cheerio = require('cheerio');

module.exports = async (name) => {
    let { data } = await axios.get(`https://coinmarketcap.com/currencies/${name}/`);
    let $ = cheerio.load(data, { decodeEntities: false });

    return {
        price: $('.sc-16r8icm-0.kjciSH.priceTitle .priceValue').text()
    }
}