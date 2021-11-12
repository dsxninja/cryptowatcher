const   TelegramBot = require('node-telegram-bot-api'),
        token = 'YOUR_TELEGRAM_BOT_TOKEN',
        bot = new TelegramBot(token, {polling: true})

bot.on('message', msg => {

})
