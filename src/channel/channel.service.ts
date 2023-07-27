import { ObjectId } from "mongodb";
import { ChannelMessageModel, ChannelModel } from "./channel.schema";
import { ChannelDocument } from "./interfaces/channel.document";
import { ChannelMessageDocument } from "./interfaces/channel.message.document";

export class ChannelService {
  //
  async create(
    name: string,
    ownerId: string
  ): Promise<ChannelDocument | undefined> {
    console.log("here2");

    console.log(ownerId);

    try {
      const channel = await ChannelModel.create({
        name,
        ownerId: new ObjectId(ownerId),
      });

      return channel;
    } catch (error) {
      console.log(error);
    }
  }

  async joinChannel(
    channelId: string,
    userId: string
  ): Promise<ChannelDocument | null> {
    return ChannelModel.findOneAndUpdate(
      { _id: new ObjectId(channelId) },
      {
        $push: { members: userId },
      },
      {
        new: true,
      }
    );
  }

  async leaveChannel(
    channelId: string,
    userId: string
  ): Promise<ChannelDocument | null> {
    return await ChannelModel.findOneAndUpdate(
      {
        _id: new ObjectId(channelId),
      },
      {
        $pull: { members: new ObjectId(userId) },
      }
    );
  }

  async addMessage(
    channelId: string,
    userId: string,
    message: string
  ): Promise<ChannelMessageDocument> {
    return ChannelMessageModel.create({
      content: message,
      senderId: new ObjectId(userId),
      channelId: new ObjectId(channelId),
      createdAt: Date.now(),
    });
  }

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<ChannelMessageDocument | null> {
    return ChannelMessageModel.findOneAndDelete({
      _id: new ObjectId(messageId),
      senderId: new ObjectId(userId),
    });
  }

  async editMessage(
    userId: string,
    messageId: string,
    newContent: string
  ): Promise<ChannelMessageDocument | null> {
    return ChannelMessageModel.findOneAndUpdate(
      {
        _id: new ObjectId(messageId),
        senderId: new ObjectId(userId),
      },
      {
        $set: { content: newContent },
      }
    );
  }

  async find(channelId: string): Promise<ChannelDocument | null> {
    const channel = await ChannelModel.findOne({
      _id: new ObjectId(channelId),
    });

    return channel;
  }

  async findAllMessages(channelId: string): Promise<ChannelMessageDocument[]> {
    return await ChannelMessageModel.find({
      channelId: new ObjectId(channelId),
    });
  }

  async isMemberOf(
    channelId: string,
    userId: string
  ): Promise<ChannelDocument | null> {
    return await ChannelModel.findOne({
      _id: new ObjectId(channelId),
      members: new ObjectId(userId),
    });
  }
}
