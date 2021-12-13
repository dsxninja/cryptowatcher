const Commands = require("../Commands");

module.exports = class Command extends Commands {
    constructor() {
        super({ name: 'help' })
    }

    setCallbacks(args, { msg, chat, from, queryId }) {}

    run(msg, args, cb) {}
}