import express from 'express';
import { PORT, BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PATH, USE_WEBHOOK, MONGO_STRING } from './config';
import { Telegraf } from 'telegraf';
import handlers from './handlers';
import db from 'mongoose';
import { Service } from './service';

const app = express()


app.use(express.json())
const bot = new Telegraf(BOT_TOKEN)

async function main() {
  console.log('Connecting to database...')
  await db.connect(MONGO_STRING, { dbName: "KHAI_BOT_TS" });
  await Service.init();

  for (const handler of handlers)
    bot.use(handler);

  if (USE_WEBHOOK) {
    app.use(await bot.createWebhook({
      domain: WEBHOOK_DOMAIN,
      path: WEBHOOK_PATH,
      drop_pending_updates: true,
    }))
  }
  else {
    bot.launch({ dropPendingUpdates: true })
  }
  const timer = setInterval(() => { Service.run_ping_before_lession(bot) }, 1000*60*5);


  process.once("SIGTERM", () => {
    clearInterval(timer)
    bot.stop('SIGTERM')
  })

  process.once("SIGINT", () => {
    bot.stop('SIGINT')
    clearInterval(timer)
  })
  console.log("Bot started")


}

if (USE_WEBHOOK) {
  app.get('/', (_, res) => {
    res.send('Webhook is working!');
  });

  app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
  });
}

main()