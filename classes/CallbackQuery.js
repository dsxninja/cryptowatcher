const Main = require("..");

module.exports = class CallbackQuery extends Main {
    constructor() {
        super();
    }

    startClass() {
        this.bot.on('callback_query', async query => {
            let args = query.data.split(':');

            console.log(args);

            if (this[args[0]] !== undefined && !args[0].includes('cmd_')) this[args[0]](args.slice(1), {
                msg: query.message,
                chat: query.message.chat,
                from: query.from,
                queryId: query.id
            })
        })
    }
}