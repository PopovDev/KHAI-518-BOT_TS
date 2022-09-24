import { Composer } from "telegraf";
import day from "../models/day";

export default Composer.command("get_week", async (ctx) => {
    const days = await day.find({})

    let text = "Days:\n";
    for (const day of days) {
        text += `${day.num} ${day.name}\n`
    }

    ctx.reply(text);
});