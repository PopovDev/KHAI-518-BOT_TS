import Days from "./models/day";

const init_days = async() => {
    if (await Days.count() !== 5) {
        await Days.create({ num: 0, name: "Понедельник" });
        await Days.create({ num: 1, name: "Вторник" });
        await Days.create({ num: 2, name: "Среда" });
        await Days.create({ num: 3, name: "Четверг" });
        await Days.create({ num: 4, name: "Пятница" });
    }
}   


export default {init_days};