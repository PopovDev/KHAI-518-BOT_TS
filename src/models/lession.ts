import { Document, Schema } from "mongoose";

export interface ILession extends Document {
    empty: boolean;
    title: string;
    teacher: string;
    link_platform: string;
    link: string;
}

export const LessionSchema = new Schema({
    empty: { type: Boolean, default: true, },
    title: { type: String, required: false, maxlength: 100, },
    teacher: { type: String, required: false, maxlength: 100, },
    link_platform: { type: String, required: false, maxlength: 100, },
    link: { type: String, required: false, maxlength: 200, }
}, { _id: false });

