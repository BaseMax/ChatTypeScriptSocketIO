import { Response, Request, NextFunction } from "express";
import { JwtPayload } from "../user/interface/jwt.payload";
import * as jwt from "jsonwebtoken";

export const authenticateJWT = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  console.log(token);
  

  const secretKey = process.env.SECRET_KEY as string;

  if (token) {
    jwt.verify(token, secretKey, (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
