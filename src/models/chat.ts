import { Document, model, Schema } from "mongoose";


export interface IChat extends Document {
    id: number;
}

const ChatSchema = new Schema({
    id: { type: Number, required: true },
});

export default model<IChat>("Chats", ChatSchema);
