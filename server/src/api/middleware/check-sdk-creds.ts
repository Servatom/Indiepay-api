import { NextFunction, Response } from "express";
import { SDKRequest } from "../../utils/types";
import { User } from "../models/user";
import { decrypt } from "../../utils/utils";

const checkSDKCreds = async (
  req: SDKRequest,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.headers.authorization?.split(" ")[1];
  if (!authToken) {
    return res.status(401).json({
      message: "No token provided. Auth failed",
    });
  }

  try {
    const userID = decrypt(authToken);

    req.userID = userID;
  } catch (err) {
    return res.status(401).json({
      message: "Invalid Auth Token",
    });
  }

  next();
};

export default checkSDKCreds;
