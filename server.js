 (async() => {
  require('dotenv').config();
  require('express-async-errors');
  const express = require('express');
  const app = express();
  const http = require('http');
  const server = http.createServer(app);
  const io = require('socket.io')(server);
  const TelegramBot = require('node-telegram-bot-api');
  const doppler = require('./doppler-secrets');

  const { TELEGRAM_TOKEN, PORT, HOST } = await doppler.getSecrets();

  const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

  async function getDevices() {
    const { DEVICES } = await doppler.getSecrets();

    return DEVICES.split(',').filter(device => device !== '');
  }

  const deviceCheckMiddleware = async (req, res, next) => {
    const { device } = req.headers;
    const devicesList = await getDevices();

    if (!device) {
      throw new Error('Device header must be presented in request.');
    }

    if (!devicesList.includes(device)) {
      throw new Error('Your device unauthorized.');
    }

    next();
  }

  app.use(deviceCheckMiddleware);
  app.use((err, req, res, next) => {
    res.status(400).json({
      status: false,
      code: 400,
      message: err.message,
    });
  })


  io.use((socket, next) => {
    const { headers } = socket.handshake;

    if (headers['user-agent'] === 'arduino-WebSocket-Client' || headers.host !== `${HOST}:${PORT}`) {
      next(new Error("Socket authentication error"));
    }
  });

  app.post('/open-gate/:option', (req, res) => {
    const { option } = req.params;
    
    switch (option) {
      case 'human':
        io.sockets.emit('openForHuman');
        break;

      case 'vehicle':
        io.sockets.emit('openForAuto');
        break;

      default:
        io.sockets.emit('blinkLED');
        break;      
    }

    res.end();
  })

  server.listen(PORT);


  bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    switch (msg.text) {
      case '🏃‍♂️ Open for a vehicle':
        io.sockets.emit('openForHuman');
        break;

      case '🚘 Open for a human being':
        io.sockets.emit('openForAuto');
        break;

      case 'Cancel':
        bot.deleteMessage(chatId, msg.message_id);
        break;

      default:
        io.sockets.emit('blinkLED');
        break;      
    }
    

    if (msg.entities && msg.entities.some(({type}) => type === 'bot_command')) {
      if (msg.text.includes('/start')) {
        bot.sendMessage(chatId, 'How you would like to open gate?', {reply_markup: {
          one_time_keyboard: true,
          keyboard: [
            [
              { text: "🚘 Open for a vehicle" },
              { text: "🏃‍♂️ Open for a human being" }
            ],
            ["Cancel"]
          ]
        }});      
      }
    } 
  });
})();