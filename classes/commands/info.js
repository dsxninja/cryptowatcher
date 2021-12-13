const Commands = require("../Commands");

module.exports = class Command extends Commands {
    constructor() {
        super({
            name: 'info',
            callbackName: 'info',
            delete: true
        })
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        let k = 1024,
            dm = decimals < 0 ? 0 : decimals,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    setSystem(cb) {
        return [
            `<b>🔧 System:</b>\n<b>Arch:</b> ${this.os.release()} / ${this.os.arch()}\n<b>Memory:</b> ${this.formatBytes(this.os.freemem())}\n<b>Platform:</b> ${this.os.platform()}\n<b>Server Uptime:</b> ${(this.os.uptime() / 3600).toFixed(1)} hours`,
            [{ text: '✨ Authors', callback_data: `${cb}:authors` }]
        ]
    }

    setAuthors(cb) {
        return [
            `<b>✨ Authors:</b>\n<b><a href="tg://user?id=2033230164">Heito</a></b>: <a href="https://heito.xyz">Site</a>\n<b><a href="tg://resolve?domain=ADXZC">dxv1d</a></b>: <a href="https://dxunity.codes">Site</a>`,
            [{ text: '🔧 System', callback_data: `${cb}:system` }]
        ]
    }

    setCallbacks(args, { msg, chat, from, queryId, cb }) {
        switch(args[0]) {
            case "system": case "authors":
                let params = args[0] === 'system' ? this.setSystem(cb) : this.setAuthors(cb);
                this.bot.editMessageText(params[0], {
                    chat_id: chat.id,
                    message_id: msg.message_id,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [ params[1] ] }
                })
                break;
        }
    }

    run(msg, args, cb) {
        let params = this.setSystem(cb);
        this.bot.sendMessage(msg.chat.id, params[0], { parse_mode: 'HTML', reply_markup: { inline_keyboard: [ params[1] ] } });
    }
}