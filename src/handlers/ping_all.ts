import { Composer } from "telegraf";
import { Chat } from "../models";

const composer = new Composer();


composer.command('ping_all', async (ctx) => {
    const adbs = await ctx.getChatAdministrators();
    const ans = adbs.filter(x => !x.user.is_bot).map(x => `[.](tg://user?id=${x.user.id})`).join('')

    await ctx.reply(ans, { parse_mode: 'Markdown' });
});
composer.command('register_chat', async (ctx) => {
    if (ctx.chat.type === 'private') {
        await ctx.reply('Команда доступна только в групповых чатах');
        return;
    }
    
    if (await Chat.findOne({ id: ctx.chat.id }).exec()) {
        await ctx.reply('Чат уже зарегистрирован');
        return;
    } 
    const chat = new Chat({ id: ctx.chat.id});
    await chat.save();
    await ctx.reply('Чат зарегистрирован');
});

composer.command('unregister_chat', async (ctx) => {
    if (ctx.chat.type === 'private') {
        await ctx.reply('Команда доступна только в групповых чатах');
        return;
    }
    if (!await Chat.findOne({ id: ctx.chat.id }).exec()) {
        await ctx.reply('Чат не зарегистрирован');
        return;
    }
    await Chat.deleteOne({ id: ctx.chat.id }).exec();
    await ctx.reply('Чат удален');
});

export default composer;