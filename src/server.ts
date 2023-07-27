import express from "express";
const app = express();
import http from "http";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserRouter } from "./user/user.router";
import bodyParser from "body-parser";
import {
  PrivateMessageRouter,
  stablishPrivateMessageSocket,
} from "./message/message.controller";
import socketJwt from "socketio-jwt";
import {
  ChannelRouter,
  stablishChannelSocket,
} from "./channel/channel.controller";
import { OnlineUsers } from "./common/socket.online.user";
import { GroupRouter, stablishGroupSocket } from "./group/group.controller";
dotenv.config();
const server = http.createServer(app);
export const io = new Server(server);

const dbUri = process.env.DATABASE_URI as string;

mongoose.connect(dbUri).then(() => {
  console.log("connected to mongodb successfully");
});

app.use(bodyParser.json());

app.use("/auth", UserRouter);
app.use("/channel", ChannelRouter);
app.use("/group", GroupRouter);
app.use("/private", PrivateMessageRouter);

const onlineUsers = new OnlineUsers();
io.on("connection", (socket: Socket) => {
  stablishPrivateMessageSocket(socket, io, onlineUsers);
  stablishChannelSocket(socket, io, onlineUsers);
  stablishGroupSocket(socket, io, onlineUsers);
  console.log(socket.id);

  socket.on("addUser", (userId) => {
    onlineUsers.addUser(userId, socket.id);
  });

  socket.on("disconnect", () => {
    onlineUsers.removeUser(socket.id);
    console.log("a user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on port : 3000");
});

module.exports = { app };
