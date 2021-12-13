const list = {};

module.exports = class UserQuery {
    constructor(bot) {
        this.bot = bot;

        this.list = list;
    }

    getList() {
        return this.list;
    }

    getUser(id) {
        return id ? this.list[id] : null;
    }

    isUser(id) {
        return this.list[id] ? true : false;
    }

    addUser(id, callback) {
        return this.list[id] = { is: true, callback };
    }

    deleteUser(id) {
        return delete this.list[id];
    }

    addQuery(msg, from, value) {
        return new Promise((res, rej) => {
            return this.bot.sendMessage(msg.chat.id, `${value?.param ? value.text : value}\n<b>If you want to cancel, write</b> /cancel`, { parse_mode: 'HTML' }).then(() => {
                return this.addUser(from.id, msg => msg.text === '/cancel' ? rej(new Error('cancel')) : res(value?.param ? { text: msg.text, param: value.param } : msg.text))
            })
        }); 
    }

    createQuery(msg, from, arr, convert = false) {
        if (this.isUser(from.id)) return;
        let num = arr.reverse().length - 1,
            queryList = [];

        return new Promise((res, rej) => {
            const send = () => this.addQuery(msg, from, arr[num]).then(val => {
                queryList.push(val);
                if (num > 0) {
                    num--;
                    send();
                } else {
                    if (convert) {
                        let list = {};
                        for (let val of queryList) list[val.param] = val.text;
                        return res(list);
                    } else return res(queryList)
                };
            }).catch(val => rej(new Error(val)));

            return send();
        })
    }
}