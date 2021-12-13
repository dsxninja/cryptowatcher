require('dotenv').config()
const
    // NPM modules
    TelegramBot = require('node-telegram-bot-api'),
    os = require('os'),
    fs = require('fs'),
    axios = require('axios').default,
    // Defualt configuration
    { TOKEN, TOKEN_DEV, GROUP_ID } = process.env,
    bot = new TelegramBot(TOKEN_DEV || TOKEN, { polling: true });
    // Libs
    // Plugins

class Main {
    constructor() {
        // Bot
        this.bot = bot;

        // Modules
        this.os = os;

        // Libs

        // Plugins
        this.UserQuery = new (require('./plugins/UserQuery.js'))(this.bot);
        this.NetWork = new (require('./plugins/network.js'))();
    }

    #loadClasses() {
        fs.readdir('./classes', { encoding: 'utf-8' }, (err, files) => {
            for (let file of files.filter(item => item.includes('.js') && !item.includes('.off'))) {
                let loadClass = require(`./classes/${file}`);
                new loadClass().startClass(); 
            }
        })
    }

    startBot() {
        this.#loadClasses();

        bot.on('message', msg => {
            if (this.UserQuery.isUser(msg.from.id)) {
                this.UserQuery.getUser(msg.from.id).callback(msg);
                this.UserQuery.deleteUser(msg.from.id);
            }
        })

        bot.getMe().then(val => console.log(`[DXH] Launching the \x1b[1m${val.username}\x1b[0m[\x1b[36m\x1b[4m${val.id}\x1b[0m] bot. :#`))

        this.bot.on('polling_error', err => console.log(err));
    }

}

new Main().startBot();

module.exports = Main;