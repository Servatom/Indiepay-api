import mongoose from "mongoose";
import { IUser, User } from "../models/user";
import jwt from "jsonwebtoken";

export const userService = {
  loginUser: async (email: string, firebaseUID: string) => {
    try {
      const result = await User.findOne({
        email: email,
        firebaseUID: firebaseUID,
      });

      if (!result) {
        return null;
      }

      const token = jwt.sign(
        {
          email: email,
          userID: result._id,
          firebaseUID: firebaseUID,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "7d",
        }
      );

      return { token, user: result };
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  createUser: async (
    email: string,
    firebaseUID: string
  ): Promise<IUser | unknown> => {
    try {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: email,
        firebaseUID: firebaseUID,
      });
      const result: IUser = await user.save();

      const token = jwt.sign(
        {
          email: email,
          userID: result._id,
          firebaseUID: firebaseUID,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "7d",
        }
      );

      return { token, user: result };
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  getUser: async (userID: string) => {
    try {
      const result = await User.findOne({ _id: userID });

      return result;
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  updateWaitlistStatus: async (userID: string, status: boolean) => {
    try {
      const result = await User.findOneAndUpdate(
        { _id: userID },
        { onWaitlist: status },
        { new: true }
      );

      return result;
    } catch (err) {
      console.log(err);
      return err;
    }
  },
};
