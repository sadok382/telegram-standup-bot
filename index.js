const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const { sendResponseToTopic } = require('./utils');
const { token, questions, MORNING_STANDUPS_TIME, STANDUPS_RESULTS_TIME, EVENING_STANDUPS_TIME, messages, WEBKIDS_CHAT_ID, chatForMonitoringUsersAnswers } = require('./data');
const { startStandup, sendStandupResults, sendOneUserResult } = require('./standups');
const { createUser, checkUserResponseStatus, getUser, addUserResponse, updateUserStep, getAllUsers } = require('./DB');

// Створення нового екземпляра бота
const bot = new TelegramBot(token, { polling: true });

// Стартова команда
bot.onText(/\/start/, async (msg) => {
    
    const chatId = msg.chat.id;
    const userName = msg.from.username || msg.from.first_name || 'Unknown';

    // Вітальне повідомлення
    bot.sendMessage(
        chatId,
        messages.greeting
    );

    sendResponseToTopic(userName, "розпочав  роботу з ботом", "/start", bot);

    const userData = await getUser(chatId);
    if(userData) {
        const status = await checkUserResponseStatus(chatId);
        if(status.answeredAllToday) {
            bot.sendMessage(chatId, messages.completeAllQuestion);
        } else if (status.startedToday) {
            bot.sendMessage(chatId, questions[userData.step - 1]);
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

    const chatId = msg?.chat?.id;

    console.log(msg?.chat);
    console.log(msg?.chat?.type);
    
    if(chatId === WEBKIDS_CHAT_ID && msg?.chat?.type !== 'private') {
        return;
    };
    
    const text = msg.text;

    // Перевірка, чи повідомлення є командою (починається зі слешу)
    if (text && text.startsWith('/')) {
        // Якщо це команда, нічого не робимо
        return;
    }

    const userName = msg?.from.username || msg?.from?.first_name || 'Unknown';

    // Перевіряємо, чи користувач відповідав сьогодні
    const status = await checkUserResponseStatus(chatId);
    if (status.answeredAllToday) {
        bot.sendMessage(chatId, messages.completeAllQuestion);
        return;
    }

    const user = await getUser(chatId);
    
    if (!user) {
        const userInfo = {
            chatId: chatId,
            username: msg.from.username || '',
            firstName: msg.from.first_name || '',
            lastName: msg.from.last_name || ''
        };
        bot.sendMessage(
            chatId,
            messages.greeting
        );
        createUser(userInfo);
        startStandup(chatId, bot);
        return;
    }
    // Обробка відповідей залежно від етапу
    if (user.step === 1) {
        sendResponseToTopic(userName, questions[0], msg.text, bot);
        addUserResponse(chatId, questions[0], msg.text);
        updateUserStep(chatId, 2);
        bot.sendMessage(chatId, questions[1]);
    } else if (user.step === 2) {
        sendResponseToTopic(userName, questions[1], msg.text, bot);
        addUserResponse(chatId, questions[1], msg.text);
        updateUserStep(chatId, 3);
        bot.sendMessage(chatId, questions[2]);
    } else if (user.step === 3) {
        sendResponseToTopic(userName, questions[2], msg.text, bot);
        addUserResponse(chatId, questions[2], msg.text);
        updateUserStep(chatId, 4);
        bot.sendMessage(chatId, 'Дякую за відповіді!');
        sendOneUserResult(chatId, bot);
    }
});

// Ранкове нагадування
schedule.scheduleJob(MORNING_STANDUPS_TIME, async () => {
    const usersArray = await getAllUsers();
    const users = usersArray.reduce((acc, user) => {
        acc[user.chatId] = user;
        return acc;
    }, {});
    
    for (const chatId in users) {
        
        const status = await checkUserResponseStatus(chatId);

        if(chatId === WEBKIDS_CHAT_ID || chatId === chatForMonitoringUsersAnswers.targetChatId) {
            continue;
        };
        
        if (status.answeredAllToday) {
            continue;
        }
        if(status.startedToday) {
            bot.sendMessage(
                chatId, 
                `${messages.morningGreeting} ${messages.pleaseFinishANswering} \n ${questions[users[chatId].step-1]}`, 
                { parse_mode: 'Markdown' }
            );
            continue;
        } else {
            await bot.sendMessage(chatId, `${messages.morningGreeting} ${messages.itsTimetoAnswer}`);
            startStandup(chatId, bot);
            continue;
        }
    }
});

// Вечірнє нагадування для тих, хто не завершив стендап
schedule.scheduleJob(EVENING_STANDUPS_TIME, async () => {
    const usersArray = await getAllUsers();
    const users = usersArray.reduce((acc, user) => {
        acc[user.chatId] = user;
        return acc;
    }, {});
    for (const chatId in users) {
        if(chatId === WEBKIDS_CHAT_ID || chatId === chatForMonitoringUsersAnswers.targetChatId) {
            continue;
        };
        const status = await checkUserResponseStatus(chatId);
        if (status.answeredAllToday) {
            continue;
        } else {
            bot.sendMessage(
                chatId, 
                `${messages.pleaseFinishANswering} \n ${questions[users[chatId].step-1]}`, 
                { parse_mode: 'Markdown' }
            );
        }
    }
});

// Функція для вивантаження відповідей за день
schedule.scheduleJob(STANDUPS_RESULTS_TIME, async () => {
    const usersArray = await getAllUsers();
    const users = usersArray.reduce((acc, user) => {
        acc[user.chatId] = user;
        return acc;
    }, {});

    sendStandupResults(users, bot);
});

const express = require('express');
const app = express();

// Тримайте сервер активним
app.get('/', (req, res) => res.send('Telegram Bot працює!'));
app.listen(3000, () => console.log(`Сервер працює на порту 3000`));
app.get('/healthcheck', (req, res) => {
    console.log(`[${new Date().toISOString()}] - /healthcheck запит отримано`);
    res.status(200).send('OK');
  });


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