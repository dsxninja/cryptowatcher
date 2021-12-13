const Commands = require("../Commands");

module.exports = class Command extends Commands {
    constructor() {
        super({
            name: 'userinfo',
            aliases: ['uinfo']
        })
    }

    run(msg, args, cb) {
        this.bot.getChatMember(msg.chat.id, msg.from.id).then(({ user }) => {
            this.bot.getUserProfilePhotos(msg.from.id).then(({ photos }) => {
                console.log(user);
                this.bot.sendPhoto(msg.chat.id, photos[0][2].file_id, {
                    caption: `<b>Username:</b> <a href="tg://user?id=${user.id}">${user.username}</a> [${user.id}]\n<b>Bot: </b>${user.is_bot ? 'Yes' : 'No'}\n<b>First Name:</b> ${user?.first_name || 'None'}\n<b>Last Name:</b> ${user?.last_name || 'None'}\n<b>Language:</b> ${user?.language_code?.toUpperCase() || 'None'}`,
                    parse_mode: 'HTML'
                });
            })
        })
    }
}