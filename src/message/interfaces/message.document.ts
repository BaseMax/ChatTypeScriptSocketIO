import { Document, ObjectId } from "mongodb";
import { CreateMessage } from "./message.create";

export interface MessageDocument extends Document {
  readonly content: string;
  readonly receiverId: ObjectId;
  readonly senderId: ObjectId;
  readonly createdAt: Date;
}
