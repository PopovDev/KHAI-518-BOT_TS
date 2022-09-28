import { Composer, Markup } from "telegraf";
import { Day } from "../models";
import { Constants, Service } from "../service";

const composer = new Composer();


const getKeyboard = (day_num: number) => {
    const buttons = [[], []];
    for (let i = 0; i < 4; i++) {
        buttons[0].push(Markup.button.callback(`${i + 1} Ч(о)`, `open_edit_less:${day_num}@${i}@0@0`));
        buttons[1].push(Markup.button.callback(`${i + 1} З`, `open_edit_less:${day_num}@${i}@1@0`));
    }
    buttons.push([Markup.button.callback(`Назад`, `back_l:${day_num}`)]);
    return Markup.inlineKeyboard(buttons).reply_markup;
};


composer.command('enable_edit', async (ctx) => {
    Constants.EDIT_MODE.mode = true;
    await ctx.reply('Режим редактирования включен');
});
composer.command('disable_edit', async (ctx) => {
    Constants.EDIT_MODE.mode = false;
    await ctx.reply('Режим редактирования выключен');
});

composer.action(/edit_mode:(\d+)/, async (ctx) => {
    const dayNum = parseInt(ctx.match[1]);
    const text = await Service.format_rosp(dayNum);
    const keyboard = getKeyboard(dayNum)
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard, disable_web_page_preview: true, });
    await ctx.answerCbQuery();
});

composer.action(/open_edit_less:(\d+)@(\d+)@(\d+)@(\d+)/, async (ctx) => {
    const dayNum = parseInt(ctx.match[1]);
    const lessionNum = parseInt(ctx.match[2]);
    const lessionType = parseInt(ctx.match[3]);
    const command = parseInt(ctx.match[4]);
    const day = await Day.findOne({ num: dayNum });
    const lession = day.lessions[lessionNum][lessionType];

    if (command === 1) {
        lession.empty = !lession.empty;
        await day.save();
    }

    const buttons = [];

    buttons.push([
        Markup.button.callback(
            `Активировать`,
            `open_edit_less:${dayNum}@${lessionNum}@${lessionType}@1`
        ),
    ]);

    buttons.push([
        Markup.button.callback(
            `Обновить`,
            `open_edit_less:${dayNum}@${lessionNum}@${lessionType}@0`
        ),
    ]);

    buttons.push([Markup.button.callback(`Назад`, `edit_mode:${dayNum}`),]);
    const keyboard = Markup.inlineKeyboard(buttons);

    let text = `Редактирование:\n${day.name} : ${lessionNum + 1}:${lessionType === 0 ? 'Ч' : 'З'} пара\n\n`;
    text += `Активна: ${!lession.empty ? "Да" : "Нет"}\n\n`;
    text += `1. Название: ${lession.title ?? "Не указанно"}\n\n`;
    text += `2. Преподаватель: ${lession.teacher ?? "Не указанно"}\n\n`;
    text += `3. Платформа: ${lession.link_platform ?? "Не указанно"}\n\n`;
    text += `4. Ссылка: ${lession.link ?? "Не указанно"}\n\n`;
    text += `/set ${dayNum}${lessionNum}${lessionType} (num) (значение)\n`;

    await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup,
        disable_web_page_preview: true,
    }).catch((e) => console.log(e.message));

    await ctx.answerCbQuery();
});

composer.command('set', async (ctx) => {
    const text = ctx.message.text.split(' ');
    if (text.length < 3) {
        return;
    }
    try {


        const dayNum = parseInt(text[1][0]);
        const lessionNum = parseInt(text[1][1]);
        const lessionType = parseInt(text[1][2]);
        const day = await Day.findOne({ num: dayNum });
        const lession = day.lessions[lessionNum][lessionType];
        const num = parseInt(text[2]);

        switch (num) {
            case 1:
                lession.title = text.slice(3).join(' ');
                break;
            case 2:
                lession.teacher = text.slice(3).join(' ');
                break;
            case 3:
                lession.link_platform = text.slice(3).join(' ');
                break;
            case 4:
                lession.link = text.slice(3).join(' ');
                break;
        }
        await day.save();
        await ctx.deleteMessage();
    } catch (e) {
        console.log(e.message);
    }

});

export default composer;