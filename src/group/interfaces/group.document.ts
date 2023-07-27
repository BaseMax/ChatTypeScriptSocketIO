import { Document, ObjectId } from "mongodb";

export interface GroupDocument extends Document {
  readonly name: string;
  readonly ownerId: ObjectId;
  readonly members?: ObjectId[];
  readonly createdAt: Date;
}
