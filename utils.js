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

function splitMessage(message, maxLength = 4096) {
    const parts = [];
    let start = 0;

    while (start < message.length) {
        let end = start + maxLength;

        // Переконуємося, що не розриваємо текст посередині слова
        if (end < message.length) {
            end = message.lastIndexOf('\n', end); // Знаходимо останній перенос рядка
            if (end < start) end = start + maxLength; // Якщо переносу немає, обрізаємо на maxLength
        }

        parts.push(message.slice(start, end));
        start = end;
    }

    return parts;
}

module.exports = {
    getCurrentDate,
    sendResponseToTopic,
    escapeMarkdown,
    unescapeMarkdown,
    splitMessage
};
