const token = '7711510623:AAEIhevwGqpcvCLzybLAA0nHP2CMYmuU2NU'; // Замініть на ваш токен
const questions = [
    '1. Що ви зробили вчора?',
    '2. Що плануєте зробити сьогодні?',
    '3. Чи є перешкоди?'
]

// test-bot topic 1
const chatForMonitoringUsersAnswers = {
    targetChatId: '-1002326612965',
    targetTopicId: '3'
}

module.exports = {
    token,
    questions,
    chatForMonitoringUsersAnswers
};