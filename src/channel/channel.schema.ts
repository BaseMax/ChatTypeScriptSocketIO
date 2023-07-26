import mongoose from "mongoose";

const channelMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

export const ChannelMessageModel = mongoose.model(
  "ChannelMessage",
  channelMessageSchema
);

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const ChannelModel = mongoose.model("Channel", channelSchema);
