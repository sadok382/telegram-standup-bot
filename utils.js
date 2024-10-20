const { chatForMonitoringUsersAnswers } = require("./data");

// Функція для отримання поточної дати у форматі "YYYY-MM-DD"
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Обробка всіх отриманих повідомлень і надсилання в test-bot
function sendResponseToTopic(userName, question, answer, bot) {
    const targetChatId = chatForMonitoringUsersAnswers.targetChatId;
    const targetTopicId = chatForMonitoringUsersAnswers.targetTopicId;
    const message = `Користувач ${userName} на питання "${question}" відповів: "${answer}"`;

    // Надсилаємо повідомлення в заданий топік
    bot.sendMessage(targetChatId, message, { message_thread_id: targetTopicId });
};

module.exports = {
    getCurrentDate,
    sendResponseToTopic
};
