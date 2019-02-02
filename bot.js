var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});

var torneios = [];

var bot = new Discord.Client();

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', function (message) {
    var userName = message.author.username + '#' + message.author.discriminator;

    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
        var param = "";

        if (args.length > 1)
            param = args[1];

        args = args.splice(1);

        switch (message.channel.name) {
            case 'treino':
                handleTreino(cmd, message, param, userName);
                break;
        }
    }
});

function handleTreino(cmd, message, param, userName) {
    switch (cmd) {
        case 'treino':
            messageAllPlayers(message.channel.members, 'Bora treinar');
            break;

        case 'criar-torneio':
            createTournament(message, param);
            break;

        case 'participar':
            joinTournament(message, param, userName);
            break;

        case 'listar-torneios':
            var tournaments = listTournaments();
            if (tournaments.trim().length == 0)
                message.reply("Não há torneios criados");
            else
                message.reply("Os torneios criados que estão em andamento são \n" + tournaments);
            break;

        case 'sair':
            quitTournament(message, param, userName);
            break;

        case 'finalizar-torneio':
            finishTournament(message, param, userName);
            break;

        case 'listar-participantes':
            var players = listPlayerFromTournament(param);

            if (players.trim().length == 0)
                message.reply("Não há participantes nesse torneio");
            else
                message.reply("Os participantes do torneio são \n" + players);
            break;

        case 'chamar-torneio':
            callPlayers(message, param);
            break;

        case 'começar-torneio':
            startTournament(message, param);
            break;

        case 'bracket':
            showBracket(message, param);
            break;
    }
}

function messageMember(member, message) {
    member.createDM()
        .then(x => x.send(message));
}

function messageAllPlayers(members, message) {
    members.forEach(member => {
        if (member != null && member != undefined) {
            member.createDM()
                .then(x => x.send(message));
        }
    });
}

function createTournament(message, name) {
    torneios.push({
        name: name.trim(),
        players: ["eu", "tu", "ele", "nos", "vos", "eles", "eita"],
        description: "",
        isRunning: true,
        closed: false,
        matches: []
    });
    message.reply("Torneio '" + name + "' criado com sucesso");
}

function joinTournament(message, tournamentName, userName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        if (!tournament.closed) {
            if (tournament.players.indexOf(userName == -1)) {
                tournament.players.push(userName);
                message.reply("Você foi incluído no torneio: " + tournamentName);
            }
            else
                message.reply("Você já está no torneio");
        }
        else
            message.reply("As inscrições pro torneio já foram encerradas.");
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function listTournaments() {
    var tournaments = "";

    torneios.forEach(tourny => {
        if (tourny.isRunning)
            tournaments += tourny.name + "\n";
    });

    return tournaments;
}

function quitTournament(message, tournamentName, userName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        var index = tournament.players.indexOf(userName);
        if (index != -1) {
            tournament.players.splice(index, 1);
            message.reply("Você saiu do torneio " + tournamentName);
        }
        else
            message.reply("Você não está nesse torneio");
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function finishTournament(message, tournamentName, userName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        if (tournament.isRunning) {
            tournament.isRunning = false;
            message.reply("Torneio " + tournamentName + " foi finalizado");
        }
        else
            message.reply("Torneio já foi finalizado");
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function listPlayerFromTournament(tournamentName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        var players = "";

        tournament.players.forEach(player => {
            players += player + "\n";
        });

        return players;
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");

    return "";
}

function callPlayers(message, tournamentName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        tournament.players.forEach(player => {
            var member = message.channel.members.find(x => (x.user.username + '#' + x.user.discriminator) == player);

            if (member != undefined && member != null) {
                messageMember(member, "O Torneio " + tournamentName + " está para começar, fique atento");
            }
        });
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function startTournament(message, tournamentName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        tournament.closed = true;

        var randomized = shuffle(tournament.players);

        for (let index = 0; index < randomized.length; index += 2) {
            const player = randomized[index];
            const nextPlayer = randomized[index + 1];

            if (nextPlayer != undefined && nextPlayer != null) {
                tournament.matches.push(player + " vs " + nextPlayer);
            }
            else
                tournament.matches.push(player + " BYE");
        }

        tournament.matches.forEach(match => {
            message.reply(match);
        });
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function showBracket(message, tournamentName) {
    var tournament = torneios.find(x => x.name == tournamentName && x.isRunning);

    if (tournament != undefined && tournament != null) {
        tournament.matches.forEach(match => {
            message.reply(match);
        });
    }
    else
        message.reply("Não foi possível localizar o torneio, o enzo deve ter feito cagado, desculpe");
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

bot.login(process.env.TOKEN || auth.token);