import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../utils/types";
import jwt from "jsonwebtoken";
import { auth } from "../../firebaseAdmin";
import { User } from "../models/user";

const checkAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "No token provided. Auth failed",
    });
  }
  try {
    // const decoded = await auth.verifyIdToken(token);
    let decoded = jwt.verify(token, process.env.JWT_KEY!);
    decoded = decoded as { userID: string };
    const user = await User.findOne({ _id: decoded.userID });
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.userData = user as AuthenticatedRequest["userData"];
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
      error,
    });
  }
};

export default checkAuth;
