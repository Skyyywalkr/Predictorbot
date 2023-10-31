const express = require('express');
const fs = require('fs');
const app = express();
const { Telegraf } = require('telegraf');
// const bot = new Telegraf('6696209709:AAGaGqBbZ0zMGHekKM-JprKWpRJdnORpqhc');
const bot = new Telegraf('6474685886:AAGTqjT-05HyKpWBqWu0Jtapl5msFFDoC9E');
const axios = require('axios');


const apiUrl = 'https://open-api.coinglass.com/public/v2/funding';
const apiKey = 'fdc772884e214a93b0cbd7a2b3ec4ad0';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    coinglassSecret: apiKey
  },
};

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


function convertIntervalToMinutes(interval) {
  const numericValue = parseInt(interval, 10);
  const unit = interval.includes('min')?interval.slice(-3):interval.slice(-1);

  switch (unit) {
    case 'min':
      return numericValue;
    case 'H':
      return numericValue * 60;
    case 'D':
      return numericValue * 60 * 24;
    default:
      return null; // Handle unsupported intervals
  }
}

async function checkFundingRateCondition(coin, action, interval) {
  try {
    const response = await axios(apiUrl, options);

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    const matchingData = response.data.data.find(data => data.symbol === coin);

    if (!matchingData) {
      throw new Error(`No data found for coin: ${coin}`);
    }

    const BinanceMarginFunding = matchingData.uMarginList[0]? matchingData.uMarginList[0].rate:'';
    const OKXMarginFunding = matchingData.uMarginList[1]? matchingData.uMarginList[1].rate:'';
    const BinanceCoinFunding = matchingData.cMarginList[0]?matchingData.cMarginList[0].rate:'';
    const OKXCoinFunding = matchingData.cMarginList[1]?matchingData.cMarginList[1].rate:'';

    console.log(BinanceMarginFunding);
    console.log(OKXMarginFunding);
    console.log(BinanceCoinFunding);
    console.log(OKXCoinFunding);

    let intervalinMin = convertIntervalToMinutes(interval)

console.log("intervalinMin",intervalinMin)

    if (intervalinMin >= 15 && intervalinMin <= 60) {

      if (action === "SELL") {

        if (BinanceMarginFunding > 0.050 && OKXMarginFunding > 0.050 && BinanceCoinFunding > 0.050 && OKXCoinFunding > 0.050) {

          return true

        } else if (BinanceMarginFunding >= -0.010 && BinanceMarginFunding <= 0.050
          && OKXMarginFunding >= -0.010 && OKXMarginFunding <= 0.050
          && BinanceCoinFunding >= -0.010 && BinanceCoinFunding <= 0.050
          && OKXCoinFunding >= -0.010 && OKXCoinFunding <= 0.050) {

          return true

        } else if (BinanceMarginFunding < -0.010 && OKXMarginFunding < -0.010 && BinanceCoinFunding < -0.010 && OKXCoinFunding < -0.010) {

          return false

        }

      } else if (action === "BUY") {


        if (BinanceMarginFunding < -0.050 && OKXMarginFunding < -0.050 && BinanceCoinFunding < -0.050 && OKXCoinFunding < -0.050) {

          return true

        } else if (BinanceMarginFunding >= -0.050 && BinanceMarginFunding <= 0.010
          && OKXMarginFunding >= -0.050 && OKXMarginFunding <= 0.010
          && BinanceCoinFunding >= -0.050 && BinanceCoinFunding <= 0.010
          && OKXCoinFunding >= -0.050 && OKXCoinFunding <= 0.010) {

          return true

        } else if (BinanceMarginFunding > 0.010 && OKXMarginFunding > 0.010 && BinanceCoinFunding > 0.010 && OKXCoinFunding > 0.010) {

          return false

        }
      }

    } else if (intervalinMin >= 240 && intervalinMin <= 720) {

      if (action === "SELL") {

        if (BinanceMarginFunding > 0.075 && OKXMarginFunding > 0.075 && BinanceCoinFunding > 0.075 && OKXCoinFunding > 0.075) {

          console.log("high Level Condition met")

          return true

        } else if (BinanceMarginFunding >= -0.025 && BinanceMarginFunding <= 0.075
          && OKXMarginFunding >= -0.025 && OKXMarginFunding <= 0.075
          && BinanceCoinFunding >= -0.0250 && BinanceCoinFunding <= 0.075
          && OKXCoinFunding >= -0.025 && OKXCoinFunding <= 0.075) {
            console.log("Low Condition met")

          return true

        } else if (BinanceMarginFunding < -0.025 && OKXMarginFunding < -0.025 && BinanceCoinFunding < -0.025 && OKXCoinFunding < -0.025) {

          console.log("No Condition met")
          return false

        }



      } else if (action === "BUY") {

        if (BinanceMarginFunding < -0.075 && OKXMarginFunding < -0.075 && BinanceCoinFunding < -0.075 && OKXCoinFunding < -0.075) {

          console.log("high Level Condition met")

          return true

        } else if (BinanceMarginFunding >= -0.075 && BinanceMarginFunding <= 0.025
          && OKXMarginFunding >= -0.075 && OKXMarginFunding <= 0.025
          && BinanceCoinFunding >= -0.075 && BinanceCoinFunding <= 0.025
          && OKXCoinFunding >= -0.075 && OKXCoinFunding <= 0.025) {

            console.log("Low Level Condition met")
          
          return true

        } else if (BinanceMarginFunding > 0.025 && OKXMarginFunding > 0.025 && BinanceCoinFunding > 0.025 && OKXCoinFunding > 0.025) {

          console.log("No Condition met")
          return false

        }


      }

    } else if (intervalinMin <= 1440) {

      if (action === "SELL") {

        if (BinanceMarginFunding > 0.100 && OKXMarginFunding > 0.100 && BinanceCoinFunding > 0.100 && OKXCoinFunding > 0.100) {

          return true

        } else if (BinanceMarginFunding >= -0.050 && BinanceMarginFunding <= 0.100
          && OKXMarginFunding >= -0.050 && OKXMarginFunding <= 0.100
          && BinanceCoinFunding >= -0.050 && BinanceCoinFunding <= 0.100
          && OKXCoinFunding >= -0.050 && OKXCoinFunding <= 0.100) {

          return true

        } else if (BinanceMarginFunding < -0.050 && OKXMarginFunding < -0.050 && BinanceCoinFunding < -0.050 && OKXCoinFunding < -0.050) {

          return false

        }


      } else if (action === "BUY") {

        if (BinanceMarginFunding < -0.100 && OKXMarginFunding < -0.100 && BinanceCoinFunding < -0.100 && OKXCoinFunding < -0.100) {

          return true

        } else if (BinanceMarginFunding >= -0.100 && BinanceMarginFunding <= 0.050
          && OKXMarginFunding >= -0.100 && OKXMarginFunding <= 0.050
          && BinanceCoinFunding >= -0.100 && BinanceCoinFunding <= 0.050
          && OKXCoinFunding >= -0.100 && OKXCoinFunding <= 0.050) {

          return true

        } else if (BinanceMarginFunding > 0.050 && OKXMarginFunding > 0.050 && BinanceCoinFunding > 0.050 && OKXCoinFunding > 0.050) {

          return false

        }
      }

    }
    
  } catch (error) {
    console.error('Error checking funding rate:', error.message);
  }
}


async function asyncPart(coin, interval, close, action, formattedMessage, messageID, chatID) {
  try {
  const fundingRateConditionMet = await checkFundingRateCondition(coin, action, interval);


    if (fundingRateConditionMet) {

      const indexToRemove = data.pendingSignals.findIndex((message) =>
      message.coin.includes(coin) && message.interval.includes(interval));

    if (indexToRemove !== -1) {
        data.pendingSignals.splice(indexToRemove, 1);

        fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

        console.log(`Message removed successfully.`);
      }

      if (action === "BUY") {

        const foundtask = data.task.find((message) =>
        message.coin.includes(coin) && message.interval.includes(interval)
      ) ? data.task.find((message) =>
        message.coin.includes(coin) && message.interval.includes(interval)
      ) : null;

      const indexToRemove = data.task.findIndex((message) =>
        message.coin.includes(coin) && message.interval.includes(interval));

        if (foundtask) {
  
        bot.telegram.sendMessage(foundtask.chatID, formattedMessage, {
          reply_to_message_id: foundtask.sellMessageID,
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

        if (indexToRemove !== -1) {
          data.task.splice(indexToRemove, 1);

          fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

          console.log(`Message removed successfully.`);
        } else {
          console.log(`Messagen not found.`);
        }

      }else {
        console.log("Buy Failed")
        bot.telegram.sendMessage(chatID, formattedMessage).then((result) => {
  
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

      }
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
          }).then((result) => {
  
            const sellMessageID = result.message_id;
    
            data.task.push({
              'message': formattedMessage,
              'sellMessageID': sellMessageID,
              'chatID': chatID,
              'coin': coin,
              'interval': interval
            })
    
            fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    
          });
  
          if (indexToRemove !== -1) {
            data.task.splice(indexToRemove, 1);
  
            fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
  
            console.log(`Message removed successfully.`);
          } else {
            console.log(`Messagen not found.`);
          }
  
        } else {
          console.log("SELL Failed")
          bot.telegram.sendMessage(chatID, formattedMessage).then((result) => {
  
            const sellMessageID = result.message_id;
    
            data.task.push({
              'message': formattedMessage,
              'sellMessageID': sellMessageID,
              'chatID': chatID,
              'coin': coin,
              'interval': interval
            })

            fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    
          });
        }
  
      }
    }else{
      console.log('Funding rate condition not met. Saving signal to the database.');
  
      const indexToRemove = data.pendingSignals.findIndex((message) =>
          message.coin.includes(coin) && message.interval.includes(interval));

        if (indexToRemove !== -1) {
            data.pendingSignals.splice(indexToRemove, 1);
  
            fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
  
            console.log(`Message removed successfully.`);
          }
            data.pendingSignals.push({
              coin,
              interval,
              close,
              action,
              formattedMessage,
              messageID,
              chatID,
            })
            fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
          

            let newDatabase;

if (data.pendingSignals) {
  newDatabase = data.pendingSignals.map((coinData) => {
    
    const { coin, interval, action, close, formattedMessage, messageID, chatID } = coinData;

  
    return { coin, interval, action, close, formattedMessage, messageID, chatID };
  });
} else {
  database = [];
}

updateDatabase(newDatabase)
    
    }
  
  } catch (error) {
    console.error('Error in checkFundingRateCondition:', error.message);

  }
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

    asyncPart(coin, interval, close, action, formattedMessage, messageID, chatID)

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






let database;

if (data.pendingSignals) {
  database = data.pendingSignals.map((coinData) => {
    
    const { coin, interval, action, close, formattedMessage, messageID, chatID } = coinData;

  
    return { coin, interval, action, close, formattedMessage, messageID, chatID };
  });
} else {
  database = [];
}


// Array to store interval IDs
const intervalIds = [];

// Function to process data for a coin
async function processData(coin, interval, action, close, formattedMessage, messageID, chatID) {
  console.log(`Processing data for ${coin}`);

  try {
    const fundingRateConditionMet = await checkFundingRateCondition(coin, action, interval);
 
     if (fundingRateConditionMet) {
 
       const indexToRemove = data.pendingSignals.findIndex((message) =>
       message.coin.includes(coin) && message.interval.includes(interval));
 
     if (indexToRemove !== -1) {
         data.pendingSignals.splice(indexToRemove, 1);
 
         fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
 
         console.log(`Message removed successfully.`);
       }


       let newDatabase;

       if (data.pendingSignals) {
         newDatabase = data.pendingSignals.map((coinData) => {
           
           const { coin, interval, action, close, formattedMessage, messageID, chatID } = coinData;
       
         
           return { coin, interval, action, close, formattedMessage, messageID, chatID };
         });
       } else {
         database = [];
       }
       
       updateDatabase(newDatabase)
 
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
     }else{
       console.log('Not Send Condition not met again.'); 
           
     }
   
   } catch (error) {
     console.error('Error in checkFundingRateCondition:', error.message);
 
   }
 }



// Function to schedule data processing based on intervals
function scheduleDataProcessing() {
  // Clear any existing intervals
  for (const intervalId of intervalIds) {
    clearInterval(intervalId);
  }

  // Initialize the array of interval IDs
  intervalIds.length = 0;

  for (const item of database) {
    const { coin, interval, action, close, formattedMessage, messageID, chatID } = item;
    const millisecondsInHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const millisecondsInMinute = 60 * 1000; // 1 minute in milliseconds

    // Check if the interval ends with 'h' for hours
    if (interval.endsWith('H')) {
      const hours = parseInt(interval, 10);
      intervalMilliseconds = hours * millisecondsInHour;
    }
    // Check if the interval ends with 'm' for minutes
    else if (interval.endsWith('min')) {
      const minutes = parseInt(interval, 10);
      intervalMilliseconds = minutes * millisecondsInMinute;
    } else {
      console.warn(`Invalid interval format for ${coin}: ${interval}`);
      continue; // Skip this coin if interval is invalid
    }

    // Schedule data processing for the coin with the calculated interval
    const intervalId = setInterval(() => {
      processData(coin, interval, action, close, formattedMessage, messageID, chatID);
    }, intervalMilliseconds);

    // Store the interval ID for later clearing
    intervalIds.push(intervalId);
  }
}

// Function to update the database with new intervals
function updateDatabase(newDatabase) {
  // Update the database with new values
  database = newDatabase;

  // Reschedule data processing based on the updated database
  scheduleDataProcessing();
}














bot.launch();

app.listen(80, () => console.log('Node.js server started on port 80.'));
