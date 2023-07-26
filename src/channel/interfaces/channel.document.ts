import { ObjectId } from "mongodb";
import { Document } from "mongoose";
export interface ChannelDocument extends Document {
  readonly members?: ObjectId[];
  readonly messages?: {
    content: string;
    senderId: ObjectId;
    createdAt: Date;
  }[];
  readonly name: string;
  readonly ownerId: ObjectId;
}
