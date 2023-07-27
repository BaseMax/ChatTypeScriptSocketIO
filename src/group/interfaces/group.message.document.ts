import { Document, ObjectId } from "mongodb";

export interface GroupMessageDocument extends Document {
  readonly content: string;
  readonly senderId: ObjectId;
  readonly groupId: ObjectId;
  readonly createdAt: Date;
}
