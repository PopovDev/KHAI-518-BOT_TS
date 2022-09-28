import { Composer, Markup } from "telegraf";
import { Day } from "../models";
import { Service } from "../service";

const composer = new Composer();


const get_keyboard_days = async (selected_day: number) => {

    const days = await Day.find({}).exec();
    const buttons = [];
    buttons.push([Markup.button.callback('Подробнее', `back_l:${selected_day}`)]);

    for (const day of days) {
        let text = day.name;

        if (day.num === selected_day)
            text = `✅ ${text}`;

        if (day.num === Service.day_now)
            text = `${text} 🔥`;

        buttons.push([Markup.button.callback(text, `day:${day.num}`)]);
    }
    return Markup.inlineKeyboard(buttons);
}

composer.command("get_week", async (ctx) => {
    const keyboard = await get_keyboard_days(Service.day_now);
    const text = await Service.format_rosp(Service.show_day);
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard.reply_markup, disable_web_page_preview: true });
});

composer.action(/day:(\d+)/, async (ctx) => {
    const day = parseInt(ctx.match[1]);
    const keyboard = await get_keyboard_days(day);
    const text = await Service.format_rosp(day);

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    }).catch(() => { console.log('error edit'); });

    await ctx.answerCbQuery();
});

composer.action(/back_w:(\d+)/, async (ctx) => {
    const day_num = parseInt(ctx.match[1]);
    const keyboard = await get_keyboard_days(day_num);
    const text = await Service.format_rosp(day_num);

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    }).catch(() => { console.log('error edit'); });

    await ctx.answerCbQuery();
});


export default composer;