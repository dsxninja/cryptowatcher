require('dotenv').config()
const   TelegramBot = require('node-telegram-bot-api'),
        { TOKEN, TOKEN_DEV } = process.env,
        bot = new TelegramBot(TOKEN_DEV || TOKEN, {polling: true}),
        os = require('os'),
        { parser, binance } = require('./modules/network.js'),
        formatBytes = require('./modules/formatBytes.js'), 
        orderList = new Object

let     netMethod = 'binance',
        orderIdx = 0

  // CMD: Help command
bot.onText(/\/help|\/start/, msg => {
    bot.sendMessage(msg.chat.id, `/price btc # Checking bitcoin price\n/info # Show server information\n/watch litecoin 260 # Watching on price litecoin, bot will anwser then your price was match with litecoin price`)
})

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
            let status = netMethod == 'binance' ? await binance(args[1] || 'ltc', args[2] || 'USDT') : await parser(args[1] || 'litecoin')
            netMethod == 'binance' ?
                bot.sendMessage(chatId, `Currency: ${status.name || status.reduction.toUpperCase()}\nPrice: ${status.price} <b>${status.currency}</b>\n${Number(status.percent) > 0 ? '🟢' : '🔴'} ${status.priceChange} ${status.percent}%`, { parse_mode: 'HTML' }) :
                bot.sendMessage(chatId, `Price: ${status.price}\n${status.percent_pos === 'up' ? '🟢' : '🔴'} ${status.percent}`)
            break;
        case '/watch':
            let price = args[1],
                typeCoin = args[2]
            // FIXME: Built normal function with promise. 
            if (!price && !typeCoin) {
                console.log(orderList);
                if (!orderList[chatId]) return bot.sendMessage(chatId, `Make your first \`/watch <price> <typeCoin>\``, { parse_mode: 'Markdown' })
                bot.sendMessage(chatId, orderList[chatId].list <= 0 ? `At the moment, the list is empty :(` : orderList[chatId].list.map((item, idx) => `<b>${idx + 1}.</b> ${item.typeCoin} <u>${item.price}</u> @${item.username}`).join('\n') + `\n\nTo delete it, write <code>/watch stop &lt;index&gt; </code>`, { parse_mode: 'HTML' })
            } else if (price !== 'stop' && typeof(Number(price)) == 'number' && typeCoin) {
                if (!orderList[chatId]) orderList[chatId] = { chatId, list: [] }
                let status = await eval(netMethod)(typeCoin || (netMethod == 'parser' ? 'litecoin' : 'ltc'))
                if (status.code) return bot.sendMessage(chatId, `You entered the name of the cryptocurrency incorrectly :#`)
                let timer = setInterval(async () => {
                    Number(status.price.replace('$', '')) >= Number(price) && status.code !== 400 ? bot.sendMessage(chatId, `Warning <b>${typeCoin}</b> got your price ${status.price}(${price}) 💵`, { parse_mode: 'HTML' }) : null
                }, 15000)
                orderList[chatId].list.push({ username: msg.from.username, msgId: msg.message_id, price, typeCoin, timer })
                bot.sendMessage(chatId, `Watcher <u><b>${typeCoin}</b></u> was started 👽`, { parse_mode: 'HTML' })
            } else if (price == 'stop' && typeof(Number(typeCoin)) == 'number') {
                let watch = orderList[chatId].list[Number(typeCoin) - 1];
                if (!watch) return bot.sendMessage(chatId, `I think you entered the wrong index :O`)
                clearInterval(watch.timer)
                orderList[chatId].list = orderList[chatId].list.filter((item, idx) => idx !== Number(typeCoin) - 1)
                bot.sendMessage(chatId, `Watcher <u><b>${watch.typeCoin}</b></u> was stoped ❌`, { parse_mode: 'HTML' })
            }
            break;
        case '/switch':
            netMethod = netMethod == 'binance' ? 'parser' : 'binance'
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
