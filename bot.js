var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});

var bot = new Discord.Client();
console.log("entrou");

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', function (message) {
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        switch (message.channel.name) {
            case 'treino':
                handleTreino(cmd, message);
                break;
        }
    }
});

function handleTreino(cmd, message) {
    switch (cmd) {
        case 'treino':
            message.channel.members.forEach(member => {
                if (member != null && member != undefined) {
                    member.createDM()
                        .then(x => x.send('Bora treinar'));
                }
            });
    }
}

bot.login(process.env.TOKEN);