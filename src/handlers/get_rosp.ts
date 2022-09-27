import { Composer, Markup } from "telegraf";
import Day from "../models/day";
import Service, { Constants } from "../service";

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

    if (Constants.EDIT_MODE.mode)
        buttons.push([Markup.button.callback('Редактировать', `edit_mode:${day_num}`)]);

    return Markup.inlineKeyboard(buttons);
};

composer.command("get_rosp", async (ctx) => {
    const keyboard = await get_keyboard_lessions(Service.show_day);
    const text = await Service.format_rosp(Service.show_day);
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard.reply_markup, disable_web_page_preview: true });
});

composer.action(/back_l:(\d+)/, async (ctx) => {
    const day_num = parseInt(ctx.match[1]);
    const keyboard = await get_keyboard_lessions(day_num);
    const text = await Service.format_rosp(day_num);
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard.reply_markup })
        .catch(() => { console.log('error edit'); });
    await ctx.answerCbQuery();
});

composer.action(/lession:(\d+)@(\d+)@(\d+)/, async (ctx) => {
    const day_num = parseInt(ctx.match[1]);
    const lession_num = parseInt(ctx.match[2]);
    const lession_type = parseInt(ctx.match[3]);
    const back_keyboard = Markup.inlineKeyboard([[Markup.button.callback('Назад', `back_l:${day_num}`)]]);
    const text = await Service.format_lession(day_num, lession_num, lession_type);
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: back_keyboard.reply_markup, disable_web_page_preview: true })
        .catch(() => { console.log('error edit'); });
    await ctx.answerCbQuery();
});


export default composer;