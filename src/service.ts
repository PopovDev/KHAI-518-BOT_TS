import { Day, Chat } from "./models";
import moment from "moment-timezone";
import { Telegraf, Context } from "telegraf";

export class Constants {
    static readonly TZ = 'Europe/Kiev';

    static readonly TIMES = {
        1: { start: "08:00", end: "09:35" }, 2: { start: "09:50", end: "11:25" },
        3: { start: "11:55", end: "13:30" }, 4: { start: "13:45", end: "15:20" },
    }
    static readonly EDIT_MODE = { mode: true };
}

export class Service {
    public static async init() {
        if (await Day.count() === 5) return;

        await Day.create({ num: 0, name: "Понедельник" });
        await Day.create({ num: 1, name: "Вторник" });
        await Day.create({ num: 2, name: "Среда" });
        await Day.create({ num: 3, name: "Четверг" });
        await Day.create({ num: 4, name: "Пятница" });
    }
    public static get day_now(): number {
        return moment().tz(Constants.TZ).isoWeekday() - 1;
    }
    public static get time_now(): string {
        return moment().tz(Constants.TZ).format("HH:mm");
    }
    public static get lession_now(): number | null {
        const time = this.time_now;
        for (const key in Constants.TIMES)
            if (time >= Constants.TIMES[key].start && time <= Constants.TIMES[key].end)
                return parseInt(key);
        return null;
    }
    public static get is_denominator(): boolean {
        const week = moment().tz(Constants.TZ).isoWeek();
        return week % 2 === 0;
    }
    public static get is_denominator_show(): boolean {
        return this.is_study_day ? this.is_denominator : !this.is_denominator;
    }
    public static get is_study_day(): boolean {
        const day = this.day_now;
        return day < 6;
    }
    public static get show_day(): number {
        const day = this.day_now;
        if (day > 4) return 0;
        return day;
    }
    public static async format_lession(day_i: number, lession_i: number, dn_i: number): Promise<string> {
        const text: Array<string> = []
        const day = await Day.findOne({ num: day_i });
        if (!day) return '';

        const lessions = day.lessions[lession_i];
        if (!lessions) return '';

        const lession = lessions[dn_i];
        if (!lession) return '';

        text.push(`День: <b>${day.name}</b>`);
        text.push(`Лекция: <b>${lession_i + 1}</b>`);
        text.push(`Начало: <b>${Constants.TIMES[lession_i + 1].start}</b>`);
        text.push(`Конец: <b>${Constants.TIMES[lession_i + 1].end}</b>\n`);
        text.push(`> <b>${lession.title ?? "Не указанно"}</b>\n`);
        text.push(`Преподаватель: <b>${lession.teacher ?? "Не указанно"}</b>\n`);
        text.push(`Платформа: <b>${lession.link_platform ?? "Не указанно"}</b>\n`);
        text.push(`Ссылка: <b>${lession.link ?? "Не указанно"}</b>\n`);

        return text.join('\n');
    }
    public static async format_rosp(day_i: number): Promise<string> {
        const text: Array<string> = []
        const day = await Day.findOne({ num: day_i });
        if (!day) return '';

        text.push(`Расписание на: <b>${day.name}</b> (${!Service.is_denominator_show ? 'Чис' : 'Знам'})\n`);

        for (const [i, [first, second]] of day.lessions.entries()) {
            const is_now = day_i === this.day_now && i + 1 === this.lession_now && this.is_study_day ? '🔥' : '';
            const times = Constants.TIMES[i + 1];
            text.push(`<b>${i + 1}.</b> ${times.start} - ${times.end}:`);
            if (first.empty && second.empty)
                text.push(`>    <b>Нет пар</b>`);
            else if (first.empty || second.empty) {
                const lession = first.empty ? second : first;
                text.push(`>    ${lession.title} ${is_now}`)
            } else
                if (this.is_denominator_show) {
                    text.push(`> Ч:    ${first.title}`)
                    text.push(`> <b>З:    <u>${second.title} ${is_now}</u></b>`)
                } else {
                    text.push(`> <b>Ч:    <u>${first.title} ${is_now}</u></b>`)
                    text.push(`> З:    ${second.title}`)
                }
            text.push('');

        }

        return text.join('\n');
    }
    public static async run_ping_before_lession(bot: Telegraf<Context>) {
        if (!this.is_study_day) return;
        if (this.lession_now) return;

        const time = moment().add(5, 'minutes').tz(Constants.TZ).format("HH:mm");
        const day = this.day_now;

        for (const key in Constants.TIMES)
            if (time >= Constants.TIMES[key].start && time <= Constants.TIMES[key].end) {
                console.log(`Пингуем ${key} пару на ${day} день`)
                const lession = await Day.findOne({ num: day }).then(day => day?.lessions[parseInt(key) - 1][this.is_denominator_show ? 1 : 0]);
                if (!lession[0].empty || !lession[1].empty) {
                    const chats = await Chat.find();
                    for (const chat of chats) {
                        const adbs = await bot.telegram.getChatAdministrators(chat.id);
                        const ans = adbs.filter(x => !x.user.is_bot).map(x => `[.](tg://user?id=${x.user.id})`).join('')
                        bot.telegram.sendMessage(chat.id, `Внимание!${ans} Пара ${key} начнется через 5 минут!`, { parse_mode: 'Markdown' });
                    }
                }
            }

    }


}