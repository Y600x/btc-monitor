const axios = require('axios');

const interval_ms = 10000;
const price_step = 100;
const api_url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
const bot_token = 'token';
const chat_id = 'chatid
const telegram_url = `https://api.telegram.org/bot${bot_token}/sendmessage`;

let last_price = null;
let last_alert_price = null;

async function send_telegram_message(text) {
  try {
    await axios.post(telegram_url, {
      chat_id: chat_id,
      text: text
    });
  } catch (error) {
    console.error('error sending telegram message:', error.message);
  }
}

async function fetchbtcprice() {
  try {
    const response = await axios.get(api_url);
    const data = response.data.bitcoin;
    const current_price = data.usd;
    const change_24h = data.usd_24h_change.toFixed(2);
    const now = new Date();

    console.log(`[${now.toLocaleTimeString()}] bitcoin price: $${current_price} (24h change: ${change_24h}%)`);

    if (last_price !== null) {
      const diff = current_price - last_price;
      const diff_percent = ((diff / last_price) * 100).toFixed(2);
      console.log(`change since last check: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} usd (${diff_percent}%)`);
    }

    if (last_alert_price === null) {
      last_alert_price = current_price;
    }

    const price_diff = current_price - last_alert_price;
    if (Math.abs(price_diff) >= price_step) {
      const direction = price_diff > 0 ? 'up' : 'down';
      const message = `bitcoin price moved ${direction} by $${Math.abs(price_diff).toFixed(2)} from last alert. current price: $${current_price}\n\ngithub: https://github.com/Y600x\ntelegram: https://t.me/FlashBytesTeam`;
      console.log(message);
      await send_telegram_message(message);
      last_alert_price = current_price;
    }

    last_price = current_price;
  } catch (error) {
    console.error('error fetching data:', error.message);
  }
}

console.log('starting bitcoin monitor...');
console.log('github: https://github.com/Y600x');
console.log('telegram: https://t.me/FlashBytesTeam');
fetchbtcprice();
setInterval(fetchbtcprice, interval_ms);
