require('dotenv').config(); 

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatForMonitoringUsersAnswers = {
    targetChatId: process.env.MANAGING_CHAT_ID,
    targetTopicId: process.env.MANAGING_TOPIC_ID
}
const questions = [
    '1. Якими задачами займався/-лась за минулу добу? Що вдалось зробити?',
    '2. Чим плануєш займатись далі?',
    '3. Які є питання чи складнощі?'
]

const messages = {
    greeting: 'Привіт! Я бот, який збиратиме ваші відповіді для щоденних стендапів. Я надсилатиму нагадування о 10:00 і о 18:00 та формуватиму відповідь команди о 19:00 щоденно. Давайте почнемо!',
    completeAllQuestion: 'Ви вже відповіли на всі питання сьогодні. Дякуємо!',
    morningGreeting: 'Доброго ранку!',
    pleaseFinishANswering: 'Будь ласка, завершіть відповіді на питання сьогоднішнього стендапу.',
    itsTimetoAnswer: 'Час відповісти на стендап-питання.'
    
}

const WEBKIDS_CHAT_ID = process.env.WEBKIDS_CHAT_ID;
const STANDUPS_TOPIC_ID = process.env.STANDUPS_TOPIC_ID;
const MEETINGS_TOPIC_ID = process.env.MEETINGS_TOPIC_ID;
const MORNING_STANDUPS_TIME = process.env.MORNING_STANDUPS_TIME;
const EVENING_STANDUPS_TIME = process.env.EVENING_STANDUPS_TIME;
const STANDUPS_RESULTS_TIME = process.env.STANDUPS_RESULTS_TIME;

module.exports = {
    token,
    questions,
    messages,
    chatForMonitoringUsersAnswers,
    WEBKIDS_CHAT_ID,
    STANDUPS_TOPIC_ID,
    MEETINGS_TOPIC_ID,
    MORNING_STANDUPS_TIME,
    EVENING_STANDUPS_TIME,
    STANDUPS_RESULTS_TIME
};