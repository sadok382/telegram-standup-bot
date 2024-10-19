require('dotenv').config(); // Імпортуємо dotenv і завантажуємо .env

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatForMonitoringUsersAnswers = {
    targetChatId: process.env.MANAGING_CHAT_ID,
    targetTopicId: process.env.MANAGING_TOPIC_ID
}
const questions = [
    '1. Що ви зробили вчора?',
    '2. Що плануєте зробити сьогодні?',
    '3. Чи є перешкоди?'
]

module.exports = {
    token,
    questions,
    chatForMonitoringUsersAnswers
};