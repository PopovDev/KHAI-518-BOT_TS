import exp from "constants";
import { Composer, Markup } from "telegraf";
import Day from "../models/day";


import service from "../service";

const composer = new Composer();
const get_keyboard_lessions = async (day_num: number) => {
    const day = await Day.findOne({ num: day_num }).exec();
    const buttons = [[]];
    for (const [i, [a, b]] of day.lessions.entries()) {
        if (a.empty && b.empty) continue;
        const is_duo = !a.empty && !b.empty;
        if (!a.empty) {
            const txt = `${i + 1} ${is_duo ? ': Ч' : ''}`;
            const callback_data = `lession:${day_num}@${i}@0`;
            buttons[0].push(Markup.button.callback(txt, callback_data));
        }
        if (!b.empty) {
            const txt = `${i + 1} ${is_duo ? ': З' : ''}`;
            const callback_data = `lession:${day_num}@${i}@1`;
            buttons[0].push(Markup.button.callback(txt, callback_data));
        }
    }
    buttons.push([Markup.button.callback('Назад', `back_w:${day_num}`)]);

    if (service.EDIT_MODE.mode)
        buttons.push([Markup.button.callback('Редактировать', `edit_mode:${day_num}`)]);

    return Markup.inlineKeyboard(buttons);
};

const get_keyboard_days = async (selected_day: number) => {
    const days = await Day.find({}).exec();
    const buttons = [];
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
    });

});



export default composer;