import mongoose from "mongoose";
import { IUser, User } from "../models/user";
import jwt from "jsonwebtoken";
import { auth } from "../../firebaseAdmin";
import { projectService } from "./project";
import { TAppStat, TDashboardStats } from "../../utils/types";
import { transactionService } from "./transaction";
import { encrypt } from "../../utils/utils";

export const userService = {
  loginUser: async (
    token: string,
    email: string,
    provider: string,
    displayName: string
  ) => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      if (!decodedToken.uid) {
        return null;
      }

      let result = await User.findOne({
        firebaseUID: decodedToken.uid,
      });

      if (!result) {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: email,
          firebaseUID: decodedToken.uid,
          provider: provider,
          displayName: displayName,
        });

        result = await user.save();
      }

      const jwtToken = jwt.sign(
        {
          email: result.email,
          userID: result._id,
          firebaseUID: result.firebaseUID,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "7d",
        }
      );

      const appAuthToken = encrypt(String(result._id));

      return { token: jwtToken, user: result, appAuthToken };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getUser: async (
    userID: string
  ): Promise<{
    user: IUser;
    appAuthToken: string;
  } | null> => {
    try {
      const result = await User.findOne({ _id: userID });
      if (!result) {
        return null;
      }
      return {
        user: result,
        appAuthToken: encrypt(String(result._id)),
      };
    } catch (err) {
      console.log(err);
      throw err;
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

  getDashboardStats: async (
    ownerID: string
  ): Promise<TDashboardStats | null> => {
    try {
      const result = await projectService.getProjectsByOwnerID(ownerID);
      if (!result) {
        return null;
      }

      let stats: TDashboardStats = {
        totalApps: result.length,
        totalOrders: 0,
        totalRevenue: 0,
        apps: [],
      };

      const txnPromise = result.map(async (project) => {
        return await transactionService.getTransactionsByProject(project._id);
      });

      const txns = await Promise.all(txnPromise);

      result.map((project, idx) => {
        let app: TAppStat = {
          _id: project._id,
          name: project.name,
          totalOrders: 0,
          pendingOrders: 0,
          revenue: 0,
        };

        const transactions = txns[idx] || [];
        stats.totalOrders += transactions.length;
        transactions.forEach((transaction) => {
          if (transaction.status === "ACCEPTED") {
            stats.totalRevenue += transaction.amount;
            app.revenue += transaction.amount;
          }
          if (transaction.status === "PENDING") {
            app.pendingOrders++;
          }
          app.totalOrders++;
        });
        console.log(app);
        stats.apps.push(app);
      });
      console.log(stats);

      return stats;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
