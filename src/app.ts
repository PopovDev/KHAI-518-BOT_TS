import express from 'express';
import { PORT, BOT_TOKEN, WEBHOOK_DOMAIN, WEBHOOK_PATH, USE_WEBHOOK, MONGO_STRING } from './config';
import { Telegraf } from 'telegraf';
import handlers from './handlers';
import db from 'mongoose';
import { Service } from './service';

const app = express()


app.use(express.json())
const bot = new Telegraf(BOT_TOKEN)
const allowIds = [
  727475349,
  983486538
]
async function main() {
  console.log('Connecting to database...')
  await db.connect(MONGO_STRING, { dbName: "KHAI_BOT_TS" });
  await Service.init();
  bot.use((ctx, next) => {
    //log every message
    console.log(ctx.message)
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      ctx.reply('Я не работаю в группах')
      return
    }
    if (allowIds.includes(ctx.from.id)) {
      return next();
    }
    else {
      ctx.reply('Ты не имеешь доступа к этому боту')
    }
  })
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
  const timer = setInterval(() => { Service.run_ping_before_lession(bot) }, 60000 * 5);


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