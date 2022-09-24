import { Document, model, Schema } from "mongoose";
import { LessionSchema, ILession } from "./lession";

export interface IDay extends Document {
    num: number;
    name: string;
    lessions: ILession[][];
}

const DaySchema = new Schema({
    num: { type: Number, required: true, unique: true, },
    name: { type: String, required: true },
    lessions: {
        type: [[LessionSchema]],
        default: [
            [{ empty: true }, { empty: true }],
            [{ empty: true }, { empty: true }],
            [{ empty: true }, { empty: true }],
            [{ empty: true }, { empty: true }],
        ]
    }
});

export default model<IDay>("Days", DaySchema);
