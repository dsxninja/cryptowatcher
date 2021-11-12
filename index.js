require('dotenv').config()
const   TelegramBot = require('node-telegram-bot-api'),
        token = process.env.TOKEN,
        bot = new TelegramBot(token, {polling: true}),
        os = require('os'),
        blockchainStatus = require('./modules/parser.js'),
        formatBytes = require('./modules/formatBytes.js')
let     timer = 0

bot.on('message', async msg => {
    const chatId = msg.chat.id
    const args = msg.text.split(' ')
    switch (args[0]) {
        case '/info':
            bot.sendMessage(chatId, `Arch: ${os.release()} / ${os.arch()}\nMemory: ${formatBytes(os.freemem())}\nPlatform: ${os.platform()}\nServer Uptime: ${(os.uptime() / 3600).toFixed(1)} hours\n`)
            break;
        case '/price':
            let status = await blockchainStatus(args[1] || 'litecoin')
            bot.sendMessage(chatId, status.price)
            break;
        case '/watch':
            let price = args[1],
                typeCoin = args[2]

            if (price == 'stop') {
                bot.sendMessage(chatId, 'Watcher was stoped ❌') 
                clearInterval(timer)
            }
            if (price && typeCoin) {
                bot.sendMessage(chatId, 'Watcher was started 👽')
                clearInterval(timer)
                timer = setInterval(() => {          
                    let status = blockchainStatus(args[1] || 'litecoin')
                    status >= price.replace('$', '') ? bot.sendMessage(chatId, `Warning ${typeCoin} got your price ${price} 💵`) : null
                }, 15000 * 60)
            }
            break;
        case '/help':
            bot.sendMessage(chatId, `/price bitcoin # Checking bitcoin price\n/info # Show server information\n/watch litecoin 260 # Watching on price litecoin, bot will anwser then your price was match with litecoin price`)
            break;
        case '/start':
            bot.sendMessage(chatId, '/help # Help information')
            break;
    }
})

