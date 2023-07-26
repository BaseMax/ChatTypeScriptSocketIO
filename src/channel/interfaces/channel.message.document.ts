import { Document, ObjectId } from "mongodb";

export interface ChannelMessageDocument extends Document {
  readonly content: string;
  readonly senderId: ObjectId;
  readonly channelId: ObjectId;
  readonly createdAt: Date;
}
