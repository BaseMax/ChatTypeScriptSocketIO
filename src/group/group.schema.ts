import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

const groupSchema = new mongoose.Schema({
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
      required: true,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GroupModel = mongoose.model("Group", groupSchema);
export const GroupMessageModel = mongoose.model(
  "GroupMessage",
  groupMessageSchema
);
