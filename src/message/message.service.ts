import { ObjectId } from "mongodb";
import { CreateMessage } from "./interfaces/message.create";
import { MessageDocument } from "./interfaces/message.document";
import { MessageModel } from "./message.schema";

export class MessageService {
  async insert(createMessageDto: CreateMessage): Promise<MessageDocument> {
    const userObjectId = new ObjectId(createMessageDto.senderId);
    const user2ObjectId = new ObjectId(createMessageDto.receiverId);

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

  async findMessageById(messageId: string): Promise<MessageDocument | null> {
    return await MessageModel.findById(messageId);
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

  async getMessagesAfter(
    userId: string,
    user2Id: string,
    createdAt: Date,
    limit: number
  ): Promise<MessageDocument[]> {
    const userObjectId = new ObjectId(userId);
    const user2ObjectId = new ObjectId(user2Id);

    console.log(userId, user2Id, limit, createdAt);

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

      createdAt: { $gt: createdAt },
    })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  async getMessagesBefore(
    userId: string,
    user2Id: string,
    createdAt: Date,
    limit: number
  ): Promise<MessageDocument[]> {
    const userObjectId = new ObjectId(userId);
    const user2ObjectId = new ObjectId(user2Id);

    const beforeMessages = await MessageModel.find(
      {
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

        createdAt: { $lt: createdAt },
      },
      { __v: 0 }
    )
      .sort({ createdAt: -1 })
      .limit(limit);

    return beforeMessages.reverse();
  }

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<MessageDocument | null> {
    return MessageModel.findOneAndRemove(
      {
        _id: new ObjectId(messageId),
        senderId: new ObjectId(userId),
      },
      { __v: 0 }
    );
  }
}
