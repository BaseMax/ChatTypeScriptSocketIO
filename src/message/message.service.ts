import { ObjectId } from "mongodb";
import { CreateMessage } from "./interfaces/message.create";
import { MessageDocument } from "./interfaces/message.document";
import { MessageModel } from "./message.schema";

export class MessageService {
  async insert(createMessageDto: CreateMessage): Promise<MessageDocument> {
    return await MessageModel.create({
      ...createMessageDto,
    });
  }

  async getAllMessagesInPrivateChat(
    userId: string,
    user2Id: string
  ): Promise<MessageDocument[]> {
    const userObjectId = new ObjectId(userId);
    const user2ObjectId = new ObjectId(user2Id);

    return await MessageModel.find({
      $or: [
        {
          senderId: userObjectId,
          receiverId: user2ObjectId,
        },

        {
          senderId: user2ObjectId,
          receiverId: userObjectId,
        },
      ],
    });
  }

  async editMessage(
    userId: string,
    messageId: string,
    content: string
  ): Promise<MessageDocument | null> {
    return await MessageModel.findOneAndUpdate(
      {
        _id: new ObjectId(messageId),
        senderId: new ObjectId(userId),
      },
      {
        $set: { content: content },
      }
    );
  }

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<MessageDocument | null> {
    return MessageModel.findOneAndRemove({
      _id: new ObjectId(messageId),
      senderId: new ObjectId(userId),
    });
  }
}
