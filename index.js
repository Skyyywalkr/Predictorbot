const express = require('express');
const fs = require('fs');
const app = express();
const { Telegraf } = require('telegraf');
const bot = new Telegraf('6474685886:AAGTqjT-05HyKpWBqWu0Jtapl5msFFDoC9E');


const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));


function searchMessageByCoinAndInterval(coinName, interval) {
  const intervalPattern = interval.replace('-', '\\s*-?\\s*');
  const regexWithInterval = new RegExp(`${coinName}\\s*\\(([^)]*${intervalPattern}[^)]*)\\)`, 'i');
  const regexWithoutInterval = new RegExp(`${coinName}\\s*\\(`);

  const foundMessageWithInterval = data.messages.find((message) => {
    return regexWithInterval.test(message.message);
  });

  if (foundMessageWithInterval) {
    return { messageID: foundMessageWithInterval.messageID, chatID: foundMessageWithInterval.chatID };
  }

  const foundMessageWithoutInterval = data.messages.find((message) => {
    return regexWithoutInterval.test(message.message);
  });

  return foundMessageWithoutInterval ? { messageID: null, chatID: foundMessageWithoutInterval.chatID } : null;
}


app.use(express.json());


app.post('/hook', (req, res) => {

  console.log('Received webhook:', req.body);
  res.sendStatus(200);

  const ticker = req.body.ticker;

  const coin = ticker.substring(0, ticker.length - 4);
  const interval = req.body.interval;
  const close = req.body.close;
  const action = req.body.action;

  console.log('Coin:', coin);
  console.log('Interval:', interval);

  if (coin && close) {

    const isBuySignal = action.startsWith('BUY');


    const messageArray = isBuySignal ? data.buy : data.sell;
    const randomIndex = Math.floor(Math.random() * messageArray.length);
    const randomMessage = messageArray[randomIndex];


    const formattedMessage = randomMessage.replace(/#Coin/g, coin + " " + "(" + interval + ")").replace(/\$X/g, `$${close}`);

    const messageData = searchMessageByCoinAndInterval(coin, interval);

    console.log('Message Data:', messageData);

    let messageID = messageData.messageID
    let chatID = messageData.chatID

    if (action === "BUY") {

      bot.telegram.sendMessage(chatID, formattedMessage, {
        reply_to_message_id: messageID,
      }).then((result) => {

        const buyMessageID = result.message_id;

        data.task.push({
          'message': formattedMessage,
          'buyMessageID': buyMessageID,
          'chatID': chatID,
          'coin': coin,
          'interval': interval
        })

        fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

      });
    } else if (action === "SELL") {

      const foundtask = data.task.find((message) =>
        message.coin.includes(coin) && message.interval.includes(interval)
      ) ? data.task.find((message) =>
        message.coin.includes(coin) && message.interval.includes(interval)
      ) : null;

      const indexToRemove = data.task.findIndex((message) =>
        message.coin.includes(coin) && message.interval.includes(interval));

      if (foundtask) {

        bot.telegram.sendMessage(foundtask.chatID, formattedMessage, {
          reply_to_message_id: foundtask.buyMessageID,
        })

        if (indexToRemove !== -1) {
          data.task.splice(indexToRemove, 1);

          fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

          console.log(`Message removed successfully.`);
        } else {
          console.log(`Messagen not found.`);
        }

      } else {
        bot.telegram.sendMessage(chatID, formattedMessage, {
          reply_to_message_id: messageID,
        })
      }

    }
  }
});


bot.on('channel_post', async (ctx) => {

  const message = ctx.update.channel_post.text;
  const messageID = ctx.update.channel_post.message_id;
  const chatID = ctx.update.channel_post.chat.id


  data.messages.push({
    'message': message,
    'messageID': messageID,
    'chatID': chatID
  })

  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

})

bot.launch();

app.listen(80, () => console.log('Node.js server started on port 80.'));
