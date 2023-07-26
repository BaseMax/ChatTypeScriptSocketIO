import express, { Request, Response } from "express";
import { UserModel } from "./user.schema";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { UserService } from "./user.service";

const UserRouter = express.Router();
const userService = new UserService();

UserRouter.post("/signup", async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  try {
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const newUser = await userService.signup(email, name, password);
    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

UserRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordCorrect = await argon2.verify(user.password, password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const secretKey = process.env.SECRET_KEY as string;

    const token = jwt.sign({ sub: user._id }, secretKey, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

export { UserRouter };
