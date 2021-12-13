const Commands = require("../Commands");

module.exports = class Command extends Commands {
    constructor() {
        super({
            name: 'watch'
        })

        this.orderList = {};
    }

    setCallbacks(args, { msg, chat, from, queryId }) {
        switch(args[0]) {
            case "delete":
                this.UserQuery.addQuery(msg, from, 'Enter the watch position to delete it.').then(val => {
                    if (!this.orderList[chat.id]?.list[val - 1]) return this.bot.sendMessage(chat.id, `We could not find the entered watch :O`);
                    this.bot.sendMessage(chat.id, `Watch <b>${this.orderList[chat.id].list[Number(val) - 1].type}</b> has been successfully deleted.`, { parse_mode: 'HTML' });
                    clearInterval(this.orderList[chat.id].list[Number(val) - 1].timer);
                    this.orderList[chat.id].list = this.orderList[chat.id].list.filter((item, idx) => idx !== Number(val) - 1);
                })
                break;
        }
    }

    async run({ chat, from, message_id }, args, cb) {
        if (args.length === 0) {
            if (!this.orderList[chat.id]) return this.bot.sendMessage(chat.id, `Make your first \`/watch <price> <typeCoin>\``, { parse_mode: 'Markdown' });
            this.bot.sendMessage(chat.id, this.orderList[chat.id].list < 1 ?
            `At the moment, the list is empty :(`
            : this.orderList[chat.id].list.map((item, idx) => `<b>${idx + 1}.</b> ${item.type} <u>${item.price}</u> @${item.username}`).join('\n'), {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: this.orderList[chat.id].list < 1 ? [] : [
                    [{ text: '❌ Delete watch', callback_data: `${cb}:delete` }]
                ] }
            });
        } else if (typeof(Number(args[0])) === 'number' && args[1]) {
            if (!this.orderList[chat.id]) this.orderList[chat.id] = { chatId: chat.id, list: [] };
            let { data } = await this.NetWork.getPrice(args[1] || 'ltc');
            if (data.code === 400) return this.bot.sendMessage(chat.id, `You entered the name of the cryptocurrency incorrectly :#`);
            let timer = setInterval(async () => {
                let { data } = await this.NetWork.getPrice(args[1] || 'ltc');
                Number(data.price) >= Number(args[0]) ? this.bot.sendMessage(chat.id, `Warning <b>${args[1]}</b> got your price ${data.price}(${args[0]}) 💵`, { parse_mode: 'HTML' }) : null;
            }, 15000)
            this.orderList[chat.id].list.push({ username: from.username, msgId: message_id, price: args[0], type: args[1], timer });
            this.bot.sendMessage(chat.id, `Watcher <u><b>${args[1]}</b></u> was started 👽`, { parse_mode: 'HTML' })
        }
    }
}