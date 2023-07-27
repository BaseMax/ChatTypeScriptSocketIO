import mongoose from "mongoose";
import { Socket, Server } from "socket.io";
import { MessageService } from "./message.service";
import { OnlineUsers } from "../common/socket.online.user";
import express, { Response } from "express";
import { authenticateJWT } from "../common/authenticate.jwt";

const messageService = new MessageService();
const PrivateMessageRouter = express.Router();

PrivateMessageRouter.get(
  "/allMessages/:userId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const user2Id = req.params.userId;

    const userId = req.user.sub;

    const messages = await messageService.getAllMessagesInPrivateChat(
      userId,
      user2Id
    );

    res.send(messages);
  }
);

PrivateMessageRouter.patch(
  "/edit/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const messageId = req.params.messageId;
    const { newContent } = req.body;

    const message = await messageService.editMessage(
      userId,
      messageId,
      newContent
    );

    res.send(message);
  }
);

PrivateMessageRouter.delete(
  "/message/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const messageId = req.params.messageId;

    const message = await messageService.deleteMessage(userId, messageId);

    res.send(message);
  }
);

PrivateMessageRouter.get(
  "/allMessagesAfterAndBefore/:messageId/:limit",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const messageId = req.params.messageId;
    const limit = +req.params.limit;
    const specificMessage = await messageService.findMessageById(messageId);
    const receiverId = specificMessage?.receiverId.toString() as string;
    const user2Id =
      receiverId === userId
        ? (specificMessage?.senderId.toString() as string)
        : receiverId;


    const beforeMessagesQuery = messageService.getMessagesBefore(
      userId,
      user2Id,
      specificMessage?.createdAt as Date,
      limit
    );
    const afterMessagesQuery = messageService.getMessagesAfter(
      userId,
      user2Id,
      specificMessage?.createdAt as Date,
      limit
    );

    const [beforeMessages, afterMessages] = await Promise.all([
      beforeMessagesQuery,
      afterMessagesQuery,
    ]);

    res.status(200).send({ beforeMessages, afterMessages });
  }
);

export function stablishPrivateMessageSocket(
  socket: Socket,
  io: Server,
  onlineUsers: OnlineUsers
) {
  socket.on("privateMessage", async (content, userId) => {
    const user = onlineUsers.get(userId);
    const senderId = onlineUsers.getUserIdBySocketId(socket.id);

    if (user) {
      socket.to(user).emit("privateMessage", { content, from: socket.id });
    }

    await messageService.insert({ senderId, content, receiverId: userId });
  });
}

export { PrivateMessageRouter };
