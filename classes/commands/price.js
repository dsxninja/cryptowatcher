const Commands = require("../Commands");

module.exports = class Command extends Commands {
    constructor() {
        super({
            name: 'price'
        })
    }

    setCallbacks(args, { msg, chat, from, queryId }) {}

    async run(msg, args, cb) {
        let { data } = await this.NetWork.getPrice(args[0] || 'ltc');
        this.bot.sendMessage(msg.chat.id, data.code === 400 ? `We couldn't find <b>${args[0]}</b> :{` : `<b>Currency:</b> ${data.reduction}\n<b>Price:</b> <u>${data.price}</u> <b>${data.currency}</b>\n${Number(data.percent) > 0 ? '🟢' : '🔴'} ${data.priceChange} ${data.percent}%`, { parse_mode: 'HTML' });
    }
}