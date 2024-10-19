const { questions } = require("./data");
const { getCurrentDate } = require("./utils");

function createUser(chatId, users) {
    users[chatId] = { step: 0, responses: [], lastResponseDate: null };

}

function getUsers(users) {
    return users;
}

// Функція для відправки запитань степдапу користувачам
function startStandup(chatId, bot, users) {
    console.log('start standup');
    
    bot.sendMessage(chatId, questions[0]);
    users[chatId] = { step: 1, responses: [] };
};

function doesUserAnsweredToday(chatId, users) {
    return users[chatId] && users[chatId].lastResponseDate === getCurrentDate() && users[chatId].step === 4
}

module.exports = {
    doesUserAnsweredToday,
    startStandup,
    createUser,
    getUsers
};
