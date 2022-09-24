import Days from "./models/day";
import moment from "moment-timezone";

const TIME_ZONE = "Europe/Kiev";

const TIMES_DEF = {
    1: { start: "8:00", end: "9:35" },
    2: { start: "9:50", end: "11:25" },
    3: { start: "11:55", end: "13:30" },
    4: { start: "13:45", end: "15:20" }
}

const EDIT_MODE = { mode: true };

const init_days = async () => {
    if (await Days.count() !== 5) {
        await Days.create({ num: 0, name: "Понедельник" });
        await Days.create({ num: 1, name: "Вторник" });
        await Days.create({ num: 2, name: "Среда" });
        await Days.create({ num: 3, name: "Четверг" });
        await Days.create({ num: 4, name: "Пятница" });
    }
}


const get_current_day = () => {
    const day = moment().tz(TIME_ZONE).day() - 1;
    if (day > 4) return 0;
    return day;
};
const get_current_time = () => moment().tz(TIME_ZONE).format("HH:mm");

const get_current_lesson = () => {
    const current_time = get_current_time();
    for (const key in TIMES_DEF) {
        if (current_time >= TIMES_DEF[key].start && current_time <= TIMES_DEF[key].end) {
            return parseInt(key);
        }
    }
    return null;
}

const get_nomitaror_denomitaror = () => {
    const now = moment().tz(TIME_ZONE);
    const ans = now.isoWeek() % 2 !== 0;
    if (moment().tz(TIME_ZONE).isoWeekday() > 5) return !ans;
    return ans;
}
const is_today_study = () => {
    const day = moment().tz(TIME_ZONE).isoWeekday()
    return day !== 6 && day !== 7;
}



const format_rosp = async (day_num: number) => {
    const day = await Days.findOne({ num: day_num }).exec();
    const nomin = get_nomitaror_denomitaror();
    const ntext = nomin ? "Чис" : "Знам";
    let text = `Расписание на <b>${day.name} (${ntext})</b>:\n\n`;

    const lession_num = get_current_lesson();
    const day_now = get_current_day();

    for (const [i, [l1, l2]] of day.lessions.entries()) {
        const num = `<b>${i + 1}.</b> `;

        const is_now = (lession_num === i + 1 && day_now === day_num && !is_today_study()) ? "🔥" : "";

        text += `${num} ${TIMES_DEF[i + 1].start} - ${TIMES_DEF[i + 1].end}:`;

        if (l1.empty && l2.empty)
            text += `  <b>Нет пар</b>\n`;
        else if (l1.empty || l2.empty)
            text += `\n>    ${(l1.empty ? l2 : l1).title} ${is_now}\n`;
        else
            if (nomin)
                text += `\n> Ч: ${l1.title}\n> З: <u><b>${l2.title}</b></u> ${is_now}\n`;
            else
                text += `\n> Ч: <u><b>${l1.title}</b></u> ${is_now}\n> З: ${l2.title}\n`;


        text += "\n";
    }

    return text;
}









export default { init_days, get_nomitaror_denomitaror, TIMES_DEF, get_current_day, get_current_time, get_current_lesson, format_rosp, EDIT_MODE, is_today_study };


