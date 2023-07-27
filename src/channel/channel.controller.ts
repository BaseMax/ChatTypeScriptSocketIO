import express, { Request, Response } from "express";
import { authenticateJWT } from "../common/authenticate.jwt";
import { ChannelService } from "./channel.service";
import { Server, Socket } from "socket.io";
import { OnlineUsers } from "../common/socket.online.user";

const ChannelRouter = express.Router();
const channelService = new ChannelService();

ChannelRouter.post(
  "/create",
  authenticateJWT,
  async (req: any, res: Response) => {
    const { name } = req.body;
    const { sub: userId, username } = req.user;

    const channel = await channelService.create(name, userId);

    res.status(200).json(channel);
  }
);

ChannelRouter.get(
  "/allMessages/:channelId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const { sub: userId, username } = req.user;
    const channelId = req.params.channelId;

    const isMember = await channelService.isMemberOf(channelId, userId);
    if (!isMember) {
      res.status(400).send("you can't access to these resources");
    }

    const messages = await channelService.findAllMessages(channelId);

    res.status(200).send(messages);
  }
);
ChannelRouter.get(
  "/allMessagesAfterAndBefore/:messageId/:limit",
  authenticateJWT,
  async (req: any, res: Response) => {
    const userId = req.user.sub;
    const messageId = req.params.messageId;
    const limit = +req.params.limit;
    const specificMessage = await channelService.findMessageById(messageId);
    const channelId = specificMessage?.channelId.toString() as string;
    const isMember = await channelService.isMemberOf(channelId, userId);

    if (!isMember) {
      res.status(400).send("you aren't part of this channel :)");
    }

    const beforeMessagesQuery = channelService.getMessagesBefore(
      channelId,
      specificMessage?.createdAt as Date,
      limit
    );
    const afterMessagesQuery = channelService.getMessagesAfter(
      channelId,
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

ChannelRouter.patch(
  "/message/edit/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const { newContent } = req.body;
    const { sub: userId, username } = req.user;
    const messageId = req.params.messageId;

    const message = await channelService.editMessage(
      userId,
      messageId,
      newContent
    );

    res.status(200).send(message);
  }
);

ChannelRouter.delete(
  "/message/:messageId",
  authenticateJWT,
  async (req: any, res: Response) => {
    const { sub: userId } = req.user;
    const messageId = req.params.messageId;

    const message = await channelService.deleteMessage(userId, messageId);
    res.status(200).send(message);
  }
);

export async function stablishChannelSocket(
  socket: Socket,
  io: Server,
  onlineUsers: OnlineUsers
) {
  socket.on("join channel", async (channelId) => {
    const userId = onlineUsers.getUserIdBySocketId(socket.id);

    const isJointChannel = await channelService.isMemberOf(channelId, userId);

    console.log(isJointChannel);

    if (!isJointChannel) await channelService.joinChannel(channelId, userId);

    socket.join(channelId);
  });

  socket.on("leave channel", async (channelId) => {
    const userId = onlineUsers.getUserIdBySocketId(socket.id);
    const isJoint = await channelService.isMemberOf(channelId, userId);

    if (isJoint) await channelService.leaveChannel(channelId, userId);

    socket.leave(channelId);
  });

  socket.on("channelMessage", async (message: string, channelId: string) => {
    const channel = await channelService.find(channelId);

    if (!channel) {
      console.log("channel with this credentials doesn't exist");
    }
    const userId = onlineUsers.getUserIdBySocketId(socket.id);

    const isAllowed = userId === channel?.ownerId.toString() ? true : false;

    if (!isAllowed) {
      console.log("you aren't allowed to send message");
    } else {
      await channelService.addMessage(channelId, userId, message);

      io.to(channelId).emit("messageReceived  ", message);
      socket.to(channelId).emit("messageReceived", {
        content: message,
        channelId: channel?._id,
        senderId: userId,
      });
    }
  });
}

export { ChannelRouter };
