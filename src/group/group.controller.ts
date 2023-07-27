import express, { Response } from "express";
import { authenticateJWT } from "../common/authenticate.jwt";
import { GroupService } from "./group.service";
import { Server, Socket } from "socket.io";
import { OnlineUsers } from "../common/socket.online.user";

const GroupRouter = express.Router();
const groupService = new GroupService();
GroupRouter.post(
  "/create",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const { name } = req.body;

    const group = await groupService.create(userId, name);

    res.status(200).send(group);
  }
);

GroupRouter.get(
  "/allMessages/:groupId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const groupId = req.params.groupId;

    const isMember = await groupService.isMemberOf(groupId, userId);

    if (!isMember) {
      res.status(400).send("you aren't part of this group :)");
    }

    const messages = await groupService.getAllMessages(groupId);
    res.status(200).send(messages);
  }
);

GroupRouter.patch(
  "/message/edit/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const { newContent } = req.body;
    const { sub: userId, username } = req.user;
    const messageId = req.params.messageId;

    const message = await groupService.editMessage(
      userId,
      messageId,
      newContent
    );

    res.status(200).send(message);
  }
);

GroupRouter.delete(
  "/messages/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const messageId = req.params.messageId;

    const message = await groupService.deleteMessage(userId, messageId);
    res.status(200).send(message);
  }
);

export async function stablishGroupSocket(
  socket: Socket,
  io: Server,
  onlineUsers: OnlineUsers
) {
  socket.on("join group", async (groupId) => {
    const userId = onlineUsers.getUserIdBySocketId(socket.id);

    const isJointChannel = await groupService.isMemberOf(groupId, userId);

    if (!isJointChannel) await groupService.joinGroup(groupId, userId);

    socket.join(groupId);
  });

  socket.on("leave group", async (groupId) => {
    const userId = onlineUsers.getUserIdBySocketId(socket.id);
    const isJoint = await groupService.isMemberOf(groupId, userId);

    if (isJoint) await groupService.leaveGroup(groupId, userId);

    socket.leave(groupId);
  });

  socket.on("groupMessage", async (message: string, groupId: string) => {
    const group = await groupService.find(groupId);

    if (!group) {
      console.log("group with this credentials doesn't exist");
    }
    const userId = onlineUsers.getUserIdBySocketId(socket.id);

    const isAllowed = groupService.isMemberOf(groupId, userId);

    if (!isAllowed) {
      console.log("you aren't allowed to send message");
    } else {
      await groupService.addMessage(groupId, userId, message);

      io.to(groupId).emit("messageReceived", message);
      socket.to(groupId).emit("messageReceived", {
        content: message,
        groupId: group?._id,
        senderId: userId,
      });
    }
  });
}

export { GroupRouter };
