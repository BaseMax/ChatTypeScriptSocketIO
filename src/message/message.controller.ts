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

    await messageService.insert({ senderId, content, receiver: userId });
  });
}

export { PrivateMessageRouter };
