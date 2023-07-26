import { Document } from "mongodb";
import { CreateMessage } from "./message.create";

export interface MessageDocument extends Document {
  readonly createdAt: Date;
}
