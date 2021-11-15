require('dotenv').config()
const   TelegramBot = require('node-telegram-bot-api'),
        { TOKEN, TOKEN_DEV } = process.env,
        bot = new TelegramBot(TOKEN_DEV || TOKEN, {polling: true}),
        os = require('os'),
        { parser, binance } = require('./modules/network.js'),
        formatBytes = require('./modules/formatBytes.js')
let     timer = 0

bot.onText(/\/help|\/start/, msg => {
    bot.sendMessage(msg.chat.id, `/price btc # Checking bitcoin price\n/info # Show server information\n/watch litecoin 260 # Watching on price litecoin, bot will anwser then your price was match with litecoin price`)
})

let netMethod = 'api'
bot.on('message', async msg => {
    const chatId = msg.chat.id
    const args = msg.text.split(' ')
    switch (args[0]) {
        case '/info':
            bot.sendMessage(chatId, `Arch: ${os.release()} / ${os.arch()}\nMemory: ${formatBytes(os.freemem())}\nPlatform: ${os.platform()}\nServer Uptime: ${(os.uptime() / 3600).toFixed(1)} hours\n`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✨ Authors', callback_data: 'info:authors' }]
                    ]
                }
            })
            break;
        case '/price':
            let status = netMethod == 'api' ? await binance(args[1] || 'ltc', args[2] || 'USDT') : await parser(args[1] || 'litecoin')
            netMethod == 'api' ?
                bot.sendMessage(chatId, `Currency: ${status.name || status.reduction.toUpperCase()}\nPrice: ${status.price} <b>${status.currency}</b>\n${Number(status.percent) > 0 ? '🟢' : '🔴'} ${status.priceChange} ${status.percent}%`, { parse_mode: 'HTML' }) :
                bot.sendMessage(chatId, `Price: ${status.price}\n${status.percent_pos === 'up' ? '🟢' : '🔴'} ${status.percent}`)
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
                timer = setInterval(async () => {          
                    let status = await parser(typeCoin || 'litecoin')
                    Number(status.price.replace('$', '')) >= Number(price) ? bot.sendMessage(chatId, `Warning ${typeCoin} got your price ${status.price}(${price}) 💵`) : null
                }, 5000 * 60)
            }
            break;
        case '/switch':
            netMethod = netMethod == 'api' ? 'parser' : 'api'
            bot.sendMessage(chatId, `Network methods was change on ${netMethod}`)
            break;
        case '/html':
            let text = '<b>bold</b>, <strong>bold</strong>\n<i>italic</i>, <em>italic</em>\n<u>underline</u>, <ins>underline</ins>\n<s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>\n<b>bold <i>italic bold <s>italic bold strikethrough</s> <u>underline italic bold</u></i> bold</b>\n<a href="http://www.example.com/">inline URL</a>\n<a href="tg://user?id=123456789">inline mention of a user</a>\n<code>inline fixed-width code</code>\n<pre>pre-formatted fixed-width code block</pre>\n<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>'
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' })
            bot.sendMessage(chatId, text)
            break;
    }
})

bot.on('callback_query', query => {
    let { message_id, chat: { id } } = query.message;
    switch(query.data) {
        case "info:system":
            bot.editMessageText(`Arch: ${os.release()} / ${os.arch()}\nMemory: ${formatBytes(os.freemem())}\nPlatform: ${os.platform()}\nServer Uptime: ${(os.uptime() / 3600).toFixed(1)} hours\n`, { chat_id: id, message_id, reply_markup: {
                inline_keyboard: [
                    [{ text: '✨ Authors', callback_data: 'info:authors' }]
                ]
            }})
            break;
        case "info:authors":
            bot.editMessageText('Authors:\n[Heito](tg://resolve?domain=AisuruHeito): [Site](https://heito.xyz)\n[dxv1d](tg://resolve?domain=ADXZC): [Site](https://dxunity.codes)', { chat_id: id, message_id, parse_mode: 'Markdown', reply_markup: {
                inline_keyboard: [
                    [{ text: '🔧 System', callback_data: 'info:system' }]
                ]
            }})
            break;
    }
})
