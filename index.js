const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const { sendResponseToTopic } = require('./utils');
const { token, questions } = require('./data');
const { startStandup } = require('./standups');

// Створення нового екземпляра бота
const bot = new TelegramBot(token, { polling: true });

// Стартова команда
bot.onText(/\/start/, async (msg) => {
    
    const chatId = msg.chat.id;
    const userName = msg.from.username || msg.from.first_name || 'Користувач';

    // Вітальне повідомлення
    bot.sendMessage(
        chatId,
        'Привіт! Я бот, який збиратиме ваші відповіді для щоденних стендапів. Я надсилатиму нагадування о 10:00 і о 18:00 та формуватиму відповідь команди о 19:00 щоденно. Давайте почнемо!'
    );

    sendResponseToTopic(userName, "розпочав  роботу з ботом", "/start", bot);

    const userData = await getUser(chatId);
    if(userData) {
        const status = await checkUserResponseStatus(chatId);
        if(status.answeredAllToday) {
            bot.sendMessage(chatId, 'Ви вже відповіли на всі питання сьогодні. Дякуємо!');
        } else {
            startStandup(chatId, bot);
        }
    } else {
        const userInfo = {
            chatId: chatId,
            username: msg.from.username || '',
            firstName: msg.from.first_name || '',
            lastName: msg.from.last_name || ''
        };
        await createUser(userInfo);
        startStandup(chatId, bot);
    }
});

// Обробка відповідей користувачів
bot.on('message', async (msg) => {
    
    const text = msg.text;

    // Перевірка, чи повідомлення є командою (починається зі слешу)
    if (text && text.startsWith('/')) {
        // Якщо це команда, нічого не робимо
        return;
    }

    const chatId = msg?.chat?.id;
    const userName = msg?.from.username || msg?.from?.first_name || 'Користувач';

    // Перевіряємо, чи користувач відповідав сьогодні
    const status = await checkUserResponseStatus(chatId);
    if (status.answeredAllToday) {
        bot.sendMessage(chatId, 'Ви вже відповіли на всі питання сьогодні. Дякуємо!');
        return;
    }

    const user = await getUser(chatId);
    // Обробка відповідей залежно від етапу
    if (user.step === 1) {
        sendResponseToTopic(userName, questions[0], msg.text, bot);
        addUserResponse(chatId, questions[0], msg.text);
        updateUserStep(chatId, 2);
        // user.responses.push(`1. ${msg.text}`);
        bot.sendMessage(chatId, questions[1]);
        // user.step = 2;
        // user.lastResponseDate = getCurrentDate();
    } else if (user.step === 2) {
        sendResponseToTopic(userName, questions[1], msg.text, bot);
        addUserResponse(chatId, questions[1], msg.text);
        updateUserStep(chatId, 3);
        // user.responses.push(`2. ${msg.text}`);
        bot.sendMessage(chatId, questions[2]);
        // user.step = 3;
        // user.lastResponseDate = getCurrentDate();
    } else if (user.step === 3) {
        sendResponseToTopic(userName, questions[2], msg.text, bot);
        addUserResponse(chatId, questions[2], msg.text);
        updateUserStep(chatId, 4);
        // user.responses.push(`3. ${msg.text}`);
        bot.sendMessage(chatId, 'Дякую за відповіді!');
        // user.step = 4; // Завершено
        // user.lastResponseDate = getCurrentDate(); // Зберігаємо дату завершення
    }
});

// Ранкове нагадування о 10:00
schedule.scheduleJob('0 8 * * *', async () => {
    const usersArray = await getAllUsers();
    const users = usersArray.reduce((acc, user) => {
        acc[user.chatId] = user; // Додаємо об'єкт користувача з chatId як ключ
        return acc;
    }, {});
    for (const chatId in users) {
        const status = await checkUserResponseStatus(chatId);
        if (status.answeredAllToday) {
            return;
        }
        if(status.startedToday) {
            bot.sendMessage(
                chatId, 
                `Доброго ранку! Будь ласка, завершіть відповіді на питання сьогоднішнього стендапу. \n ${questions[users[chatId].step-1]}`, 
                { parse_mode: 'Markdown' }
            );
            return;
        } else {
            bot.sendMessage(chatId, 'Доброго ранку! Час відповісти на стендап-питання.');
            startStandup(chatId, bot);
            return;
        }
    }
});

// Вечірнє нагадування о 18:00 для тих, хто не завершив стендап
schedule.scheduleJob('0 16 * * *', async () => {
    const usersArray = await getAllUsers();
    const users = usersArray.reduce((acc, user) => {
        acc[user.chatId] = user;
        return acc;
    }, {});
    for (const chatId in users) {
        const status = await checkUserResponseStatus(chatId);
        if (status.answeredAllToday) {
            return;
        } else {
            bot.sendMessage(
                chatId, 
                `Будь ласка, завершіть відповіді на питання сьогоднішнього стендапу. \n ${questions[users[chatId].step-1]}`, 
                { parse_mode: 'Markdown' }
            );
        }
    }
});

// // Функція для вивантаження відповідей о 19:00
// schedule.scheduleJob('0 19 * * *', () => {
//     let responsesText = 'Зібрані відповіді за день:\n\n';
//     for (const chatId in users) {
//         const user = users[chatId];
//         if (user.responses.length > 0) {
//             responsesText += `Користувач ${chatId}:\n`;
//             responsesText += user.responses.join('\n') + '\n\n';
//         }
//     }
//     // Надсилаємо відповіді в групу або адміністратору
//     bot.sendMessage('-4527552372', responsesText); // Замініть ВАШ_CHAT_ID на ID групи або адміністратора
// });



// Виведення ід групи і топіку при надсиланні повідомлення
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const topicId = msg.message_thread_id; // ID топіка (якщо є)

//     // Виводимо ID групи і ID топіка в консоль
//     console.log(`ID групи: ${chatId}`);
//     if (topicId) {
//         console.log(`ID топіка: ${topicId}`);
//     } else {
//         console.log('Повідомлення не в топіку');
//     }

//     // Надсилаємо повідомлення з ID групи та топіка
//     let response = `ID вашої групи: ${chatId}`;
//     if (topicId) {
//         response += `\nID вашого топіка: ${topicId}`;
//     } else {
//         response += '\nЦе повідомлення не в топіку.';
//     }

//     bot.sendMessage(chatId, response, { message_thread_id: topicId });
// });

const express = require('express');
const { createUser, checkUserResponseStatus, getUser, addUserResponse, updateUserStep, getAllUsers } = require('./DB');
const app = express();
const PORT = process.env.PORT || 3000;

// Тримайте сервер активним
app.get('/', (req, res) => res.send('Telegram Bot працює!'));
app.listen(3000, () => console.log(`Сервер працює на порту 3000`));