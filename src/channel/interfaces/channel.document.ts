import { ObjectId } from "mongodb";
import { Document } from "mongoose";
export interface ChannelDocument extends Document {
  readonly members?: ObjectId[];
  readonly name: string;
  readonly ownerId: ObjectId;
  readonly createdAt: Date;
}
