const
    Main = require(".."),
    fs = require('fs');

let listCommands = {};

module.exports = class Commands extends Main {
    /**
     * 
     * @param { Object } options
     * @param { String } options.name What key will be used to call the command.
     * @param { String } options.description Description of the command.
     * @param { String } options.callbackName Which key will be used to call the 'callbackQuery'
     * @param { Boolean } options.delete Should I delete the command after writing it?
     * 
    */
    constructor(options) {
        super();

        this.listCommands = listCommands;

        if (options) this.options = this.listCommands[options.name] = { ...options, isActive: true };
    }

    #addCommand(cmd, info) {
        this.bot.onText(new RegExp(`/${info.name}${info.aliases && info.aliases.length > 0 ? `|/${info.aliases.join('|/')}` : ''}`, 'g'), msg => {
            if (!this.isCommand(info.name)) return;
            if (info.delete) this.bot.deleteMessage(msg.chat.id, msg.message_id);
            cmd.run(msg, msg.text.split(' ').slice(1), `cmd_${info.callbackName || info.name}`);
        });
        if (cmd.setCallbacks) this.bot.on('callback_query', query => {
            if (!this.isCommand(info.name)) return;
            let args = query.data.split(':');
            if (args[0] === `cmd_${info.name}`) cmd.setCallbacks(args.slice(1), {
                msg: query.message,
                chat: query.message.chat,
                from: query.from,
                queryId: query.id,
                cb: `cmd_${info.callbackName || info.name}`
            });
        })
    }

    isCommand(name) {
        return this.listCommands[name].isActive;
    }

    #loadCommands() {
        fs.readdir('./classes/commands', { encoding: 'utf-8' }, (err, files) => {
            for (let file of files.filter(item => item.includes('.js') && !item.includes('.off'))) {
                let command = new (require(`./commands/${file}`))();
                if (command.options.name) this.#addCommand(command, command.options);
            }
        });
    }

    startClass() {
        this.#loadCommands();
    }

}