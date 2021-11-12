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
            bot.sendMessage(chatId, `Price: ${status.price}\n${status.percent_pos === 'up' ? '🟢' : '🔴'} ${status.percent}`)
            break;
        case '/watch':
            let price = args[1],
                typeCoin = args[2]

            if (price == 'stop') {
                bot.sendMessage(chatId, 'Watcher was stoped :x:') 
                clearInterval(timer)
            }
            if (price && typeCoin) {
                bot.sendMessage(chatId, 'Watcher was started :alien:')
                clearInterval(timer)
                timer = setInterval(async () => {          
                    let status = await blockchainStatus(typeCoin || 'litecoin')
                    Number(status.price.replace('$', '')) >= Number(price) ? bot.sendMessage(chatId, `Warning ${typeCoin} got your price ${status.price}(${price}) 💵`) : null
                }, 5000 * 60)
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