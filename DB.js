require('dotenv').config();
const mongoose = require('mongoose');
const { getCurrentDate } = require('./utils');

// Підключення до MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Успішне підключення до MongoDB!'))
.catch(err => console.error('Помилка підключення до MongoDB:', err));

// Створення схеми для користувачів
const userSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    responses: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
            date: { type: String, required: true }
        }
    ],
    step: { type: Number, default: 0 },
    lastResponseDate: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);

// Функція для створення нового користувача
async function createUser(userInfo) {
    try {
        const user = new User({
            chatId: userInfo.chatId,
            username: userInfo.username || '',
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || ''
        });
        await user.save();
        console.log(`Користувач з chatId ${userInfo.chatId} створений з повною інформацією.`);
        return user;
    } catch (err) {
        console.error('Помилка створення користувача:', err);
        return null;
    }
}

// Функція для отримання користувача за chatId
async function getUser(chatId) {
    try {
        const user = await User.findOne({ chatId });
        return user;
    } catch (err) {
        console.error('Помилка отримання користувача:', err);
        return null;
    }
}

// Функція для оновлення даних користувача
async function updateUser(chatId, updates) {
    try {
        const user = await User.findOneAndUpdate({ chatId }, updates, { new: true });
        console.log(`Користувача з chatId ${chatId} оновлено.`);
        return user;
    } catch (err) {
        console.error('Помилка оновлення користувача:', err);
        return null;
    }
}

// Функція для отримання всіх користувачів
async function getAllUsers() {
    try {
        const users = await User.find({});
        return users;
    } catch (err) {
        console.error('Помилка отримання всіх користувачів:', err);
        return [];
    }
}

// Функція для додавання відповіді користувача
async function addUserResponse(chatId, question, answer) {
    const date = new Date().toISOString().split('T')[0]; // Поточна дата у форматі YYYY-MM-DD

    try {
        const user = await User.findOne({ chatId });

        if (user) {
            user.responses.push({ question, answer, date });
            user.lastResponseDate = date;
            await user.save();
            console.log(`Відповідь користувача з chatId ${chatId} збережена.`);
            return user;
        } else {
            console.error('Користувача не знайдено.');
            return null;
        }
    } catch (err) {
        console.error('Помилка додавання відповіді користувача:', err);
        return null;
    }
}

async function updateUserStep(chatId, step) {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { chatId }, // Умова пошуку
            { step },   // Оновлюване поле
            { new: true } // Повертає новий об'єкт після оновлення
        );

        if (updatedUser) {
            console.log(`Користувач з chatId ${chatId} оновлений. Новий step: ${step}`);
        } else {
            console.log(`Користувача з chatId ${chatId} не знайдено.`);
        }

        return updatedUser;
    } catch (err) {
        console.error('Помилка оновлення step користувача:', err);
        return null;
    }
}

async function checkUserResponseStatus(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (!user) return { startedToday: false, answeredAllToday: false };

        const currentDate = getCurrentDate();

        // Перевірка статусу користувача
        const startedToday = user.lastResponseDate === currentDate && user.step > 0;
        const answeredAllToday = user.lastResponseDate === currentDate && user.step === 4;

        return { startedToday, answeredAllToday };
    } catch (err) {
        console.error('Помилка перевірки статусу відповіді користувача:', err);
        return { startedToday: false, answeredAllToday: false };
    }
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    getAllUsers,
    addUserResponse,
    updateUserStep,
    checkUserResponseStatus
};
