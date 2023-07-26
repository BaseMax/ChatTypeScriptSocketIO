import { Document } from "mongoose";

export interface UserDocument extends Document {
  readonly name: string;
  readonly password: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly socketId: string;
}
