import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String, default: null }, // Store the active socket ID for the user
  createdAt: { type: Date, default: Date.now },
  // Add other fields relevant to your application
});

export const UserModel = mongoose.model("User", userSchema);
