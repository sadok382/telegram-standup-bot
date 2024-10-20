const { questions } = require("./data");
const { updateUserStep, getUser } = require("./DB");
const { getCurrentDate } = require("./utils");

// Функція для відправки запитань степдапу користувачам
function startStandup(chatId, bot) {
    console.log('start standup');
    
    bot.sendMessage(chatId, questions[0]);
    updateUserStep(chatId, 1);
};

async function sendStandupResults(users, bot) {
    const currentDate = getCurrentDate();
    let message = `*Стендапи за ${currentDate}*\n\n`; // Заголовок повідомлення

    // Ітеруємо по кожному користувачу
    let userIndex = 1; // Порядковий номер
    for (const userId in users) {
        const user = users[userId];
        const responses = user.responses.filter(response => response.date === currentDate);

        // Пропускаємо користувача, якщо немає відповідей за поточну дату
        if (responses.length === 0) continue;

        // Додаємо інформацію про користувача
        message += `${userIndex}. *${user.firstName || user.username || 'Користувач'}*\n`;

        // Додаємо відповіді користувача
        responses.forEach(response => {
            message += `_${response.question}_\n`; // Питання курсивом
            message += `${response.answer}\n`; // Відповідь звичайним текстом
        });

        message += '\n'; // Розділення між користувачами
        userIndex++; // Збільшуємо порядковий номер
    }

    // Якщо є результати, відправляємо повідомлення
    if (userIndex > 1) {
        const targetChatId = '-1002326612965'; // Замініть на ID вашої групи
        const targetTopicId = '3';
        try {
            // await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            await bot.sendMessage(targetChatId, message, { parse_mode: 'Markdown', message_thread_id: targetTopicId });
            
            console.log('Результати стендапу успішно відправлені.');
        } catch (err) {
            console.error('Помилка надсилання результатів стендапу:', err);
        }
    } else {
        console.log('Немає результатів для відправки.');
    }
}

async function sendOneUserResult(chatId, bot) {
    const currentDate = getCurrentDate();
    const user = await getUser(chatId);
    const responses = user.responses.filter(response => response.date === currentDate);

    // Пропускаємо, якщо немає відповідей за поточну дату
    if (responses.length === 0) {
        console.log(`Немає відповідей за ${currentDate} для користувача ${user.chatId}.`);
        return;
    }

    // Формуємо повідомлення з результатами стендапу для одного користувача
    let message = `*Відповіді ${user.firstName || user.username || 'Користувач'} за ${currentDate}*\n\n`;

    responses.forEach(response => {
        message += `_${response.question}_\n`; // Питання курсивом
        message += `${response.answer}\n`; // Відповідь звичайним текстом
    });

    const targetChatId = '-1002326612965'; // Замініть на ID вашої групи
    const targetTopicId = '3';
    try {
        await bot.sendMessage(targetChatId, message, { parse_mode: 'Markdown', message_thread_id: targetTopicId });
            
        console.log(`Результати стендапу успішно відправлені в чат ${targetChatId}.`);
    } catch (err) {
        console.error(`Помилка надсилання результатів стендапу в чат ${chatId}:`, err);
    }
}

module.exports = {
    startStandup,
    sendStandupResults,
    sendOneUserResult
};
