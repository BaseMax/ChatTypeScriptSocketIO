import { ObjectId } from "mongodb";
import { GroupModel, GroupMessageModel } from "./group.schema";
import { GroupDocument } from "./interfaces/group.document";
import { GroupMessageDocument } from "./interfaces/group.message.document";

export class GroupService {
  async create(ownerId: string, name: string): Promise<GroupDocument> {
    return GroupModel.create({
      name,
      ownerId: new ObjectId(ownerId),
    });
  }



  async find(groupId: string): Promise<GroupDocument | null> {
    const channel = await GroupModel.findOne({
      _id: new ObjectId(groupId),
    });

    return channel;
  }


  async joinGroup(
    groupId: string,
    userId: string
  ): Promise<GroupDocument | null> {
    return GroupModel.findOneAndUpdate(
      { _id: new ObjectId(groupId) },
      {
        $push: { members: userId },
      },
      {
        new: true,
      }
    );
  }

  async leaveGroup(
    groupId: string,
    userId: string
  ): Promise<GroupDocument | null> {
    return await GroupModel.findOneAndUpdate(
      {
        _id: new ObjectId(groupId),
      },
      {
        $pull: { members: new ObjectId(userId) },
      }
    );
  }





  async isMemberOf(groupId: string, userId: string): Promise<Boolean> {
    const group = await GroupModel.findOne({
      _id: new ObjectId(groupId),
      members: new ObjectId(userId),
    });

    return group !== null ? true : false;
  }


  async addMessage(
    groupId: string,
    userId: string,
    message: string
  ): Promise<GroupMessageDocument> {
    return GroupMessageModel.create({
      content: message,
      senderId: new ObjectId(userId),
      groupId: new ObjectId(groupId),
      createdAt: Date.now(),
    });
  }

  async getAllMessages(groupId: string): Promise<GroupMessageDocument[]> {
    return await GroupMessageModel.find({
      groupId: new ObjectId(groupId),
    });
  }


  async editMessage(
    userId: string,
    messageId: string,
    newContent: string
  ): Promise<GroupMessageDocument | null> {
    return GroupMessageModel.findOneAndUpdate(
      {
        _id: new ObjectId(messageId),
        senderId: new ObjectId(userId),
      },
      {
        $set: { content: newContent },
      }
    );
  }





  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<GroupMessageDocument | null> {
    return GroupMessageModel.findOneAndDelete({
      _id: new ObjectId(messageId),
      senderId: new ObjectId(userId),
    });
  }


}
