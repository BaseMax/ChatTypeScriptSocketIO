import { UserDocument } from "./interface/user.interface";
import { UserModel } from "./user.schema";
import * as argon2 from "argon2";
export class UserService {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      email: email,
    });
  }

  async signup(
    email: string,
    name: string,
    password: string
  ): Promise<UserDocument> {
    const hashedPassword = await argon2.hash(password);
    return UserModel.create({
      email,
      name,
      password: password,
      createdAt: new Date(),
    });
  }

  async updateSocketId(
    email: string,
    socketId: string
  ): Promise<UserDocument | null> {
    return UserModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        socketId: socketId,
      }
    );
  }
}
