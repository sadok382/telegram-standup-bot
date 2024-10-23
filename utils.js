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

// Функція для екранування символів у Markdown
function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Функція для видалення екранування символів у Markdown
function unescapeMarkdown(text) {
    return text.replace(/\\([_*\[\]()~`>#+\-=|{}.!])/g, '$1');
}

module.exports = {
    getCurrentDate,
    sendResponseToTopic,
    escapeMarkdown,
    unescapeMarkdown
};
