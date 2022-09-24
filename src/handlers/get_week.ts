import { Composer, Markup } from "telegraf";
import Day from "../models/day";


import service from "../service";

const composer = new Composer();


const get_keyboard_days = async (selected_day: number) => {
    const days = await Day.find({}).exec();
    const buttons = [];
    console.log(selected_day);
    buttons.push([Markup.button.callback('Подробнее', `back_l:${selected_day}`)]);

    for (const day of days) {
        let text = day.name;

        if (day.num === selected_day)
            text = `✅ ${text}`;

        if (day.num === service.get_current_day() && service.is_today_study())
            text = `${text} 🔥`;

        buttons.push([Markup.button.callback(text, `day:${day.num}`)]);
    }
    return Markup.inlineKeyboard(buttons);
}

composer.command("get_week", async (ctx) => {
    const day = service.get_current_day();
    const keyboard = await get_keyboard_days(day);
    const text = await service.format_rosp(day);
    await ctx.replyWithHTML(text, keyboard);
});

composer.action(/day:(\d+)/, async (ctx) => {
    const day = parseInt(ctx.match[1]);
    const keyboard = await get_keyboard_days(day);
    const text = await service.format_rosp(day);

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    }).catch(() => { console.log('error edit'); });

    await ctx.answerCbQuery();
});

composer.action(/back_w:(\d+)/, async (ctx) => {
    const day_num = parseInt(ctx.match[1]);
    const keyboard = await get_keyboard_days(day_num);
    const text = await service.format_rosp(day_num);

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    }).catch(() => { console.log('error edit'); });

    await ctx.answerCbQuery();
});


export default composer;