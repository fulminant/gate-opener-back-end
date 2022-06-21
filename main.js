const TelegramBot = require('node-telegram-bot-api');

const token = '5396797860:AAHavbF089gF_UV81mgnMawBuNcfKaF7g1g';

const bot = new TelegramBot(token, {polling: true});


// bot.onText(/\/start/, (msg) => { ... });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  console.log(msg, 'modl');

  if (msg.entities && msg.entities.some(({type}) => type === 'bot_command')) {
    if (msg.text.includes('/start') || msg.text.includes('/toggle_auto')) {
      bot.sendMessage(chatId, 'How you would like to open gate?', {reply_markup: {
        one_time_keyboard: true,
        keyboard: [
                [{
                        text: "🚘 For a vehicle",
                        callback_data: 'dog'
                    },
                    {
                        text: "🏃‍♂️ For a human being",
                        callback_data: 'cat'
                    }
                ],
                ["Cancel"]

            ]
      }});      
    }
  } 
});


bot.on('callback_query', (msg) => {
  console.log(msg, 'sdkjhfs');
  const chatId = msg.message.chat.id;

  bot.sendMessage(chatId, 'Gate starts moving.... ',
    // {reply_markup: {
    //     keyboard: [
    //             [{
    //                     text: "🚘 For a vehicle",
    //                     callback_data: 'dog'
    //                 },
    //                 {
    //                     text: "🏃‍♂️ For a human being",
    //                     callback_data: 'cat'
    //                 }
    //             ],

    //         ]
    //   }}
      );
});