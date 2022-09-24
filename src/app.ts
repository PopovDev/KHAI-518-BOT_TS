import express from 'express';
import { PORT, BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PATH } from './config';
import { Telegraf } from 'telegraf';

const app = express()
const bot = new Telegraf(BOT_TOKEN)


async function main() {
  const hook =await bot.createWebhook({
    domain: WEBHOOK_DOMAIN,
    path: WEBHOOK_PATH,
  });
  app.use(express.json())
  app.use(hook)
}

main()



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});



bot.on("message", (ctx) => {
  ctx.reply("Hello World!")
})




process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
