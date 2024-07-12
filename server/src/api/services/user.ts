import mongoose from "mongoose";
import { IUser, User } from "../models/user";
import jwt from "jsonwebtoken";
import { auth } from "../../firebaseAdmin";

export const userService = {
  loginUser: async (
    token: string,
    firebaseUID: string,
    email: string,
    provider: string,
    displayName: string
  ) => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      if (decodedToken.uid !== firebaseUID) {
        return null;
      }

      let result = await User.findOne({
        firebaseUID: firebaseUID,
      });

      if (!result) {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: email,
          firebaseUID: firebaseUID,
          provider: provider,
          displayName: displayName,
        });

        result = await user.save();
      }

      const jwtToken = jwt.sign(
        {
          email: result.email,
          userID: result._id,
          firebaseUID: firebaseUID,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "60d",
        }
      );

      return { token: jwtToken, user: result };
    } catch (err) {
      console.log(err);
      throw err;
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
