import Days from "./models/day";
import moment from "moment-timezone";

export class Constants {
    static readonly TZ = 'Europe/Kiev';

    static readonly TIMES = {
        1: { start: "8:00", end: "9:35" }, 2: { start: "9:50", end: "11:25" },
        3: { start: "11:55", end: "13:30" }, 4: { start: "13:45", end: "15:20" }
    }
    static readonly EDIT_MODE = { mode: true };
}

export default class Service {
    public static async init() {
        if (await Days.count() === 5) return;

        await Days.create({ num: 0, name: "Понедельник" });
        await Days.create({ num: 1, name: "Вторник" });
        await Days.create({ num: 2, name: "Среда" });
        await Days.create({ num: 3, name: "Четверг" });
        await Days.create({ num: 4, name: "Пятница" });
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
    public static get is_study_day(): boolean {
        const day = this.day_now;
        return day >= 0 && day <= 4;
    }
    public static get show_day(): number {
        const day = this.day_now;
        if (day > 4) return 0;
        return day;
    }
    public static async format_lession(day_i: number, lession_i: number, dn_i: number): Promise<string> {
        const text: Array<string> = []
        const day = await Days.findOne({ num: day_i });
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
        const day = await Days.findOne({ num: day_i });
        if (!day) return '';

        text.push(`Расписание на: <b>${day.name}</b> (${!Service.is_denominator ? 'Чис' : 'Знам'})\n`);

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
                if (this.is_denominator) {
                    text.push(`> Ч:    ${first.title} ${is_now}`)
                    text.push(`> <b>З:    <u>${second.title} ${is_now}</u></b>`)
                } else {
                    text.push(`> <b>Ч:    <u>${first.title} ${is_now}</u></b>`)
                    text.push(`> З:    ${second.title} ${is_now}`)
                }
            text.push('');

        }

        return text.join('\n');
    }
}