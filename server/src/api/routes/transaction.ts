import express, { NextFunction, Response } from "express";
import checkAuth from "../middleware/check-auth";
import { AuthenticatedRequest } from "../../utils/types";
import { CreateTransactionRequest, ResolveTransactionRequest } from "./types";
import { User } from "../models/user";
import { decrypt } from "../../utils/utils";
import { INewTransaction } from "../models/transaction";
import { transactionService } from "../services/transaction";

const router = express.Router();

router.post(
  "/:projectID",
  async (req: CreateTransactionRequest, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization?.split(" ")[1];
    if (!authToken) {
      return res.status(401).json({
        message: "No token provided. Auth failed",
      });
    }
    const userID = decrypt(authToken);

    const { upiRefID, userVPA, amount, currency, metadata, timestamp } =
      req.body;
    const projectID = req.params.projectID;

    if (!upiRefID || !userVPA || !amount || !currency) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    try {
      const user = await User.findOne({ _id: userID });
      if (!user) {
        return res.status(401).json({
          message: "Invalid token. Auth failed",
        });
      }
      const txn: INewTransaction = {
        upiRefID: upiRefID,
        userVPA: userVPA,
        amount: amount,
        currency: currency,
        metadata: metadata,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      };

      console.log(txn);

      const result = await transactionService.addTransaction(
        txn,
        projectID,
        user._id
      );
      return res.status(201).json({
        message: "Transaction added successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.get(
  "/all",
  checkAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    // get projectID from query params
    const projectID = req.query.projectID as string;
    console.log(projectID);
    try {
      let result;
      if (projectID) {
        result = await transactionService.getTransactionsByProject(projectID);
      } else {
        result = await transactionService.getTransactionsByUser(userID);
      }
      return res.status(200).json({
        message: "Projects fetched successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.get(
  "/:transactionID",
  checkAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    const transactionID = req.params.transactionID;
    try {
      const result = await transactionService.getTransaction(transactionID);
      if (!result) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      if (result.ownerID !== userID) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }
      return res.status(200).json({
        message: "Transaction fetched successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.patch(
  "/:transactionID",
  checkAuth,
  async (req: ResolveTransactionRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    const transactionID = req.params.transactionID;
    const { status } = req.body;
    try {
      const result = await transactionService.updateTransactionStatus(
        userID,
        transactionID,
        status
      );
      if (!result) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      return res.status(200).json({
        message: "Transaction updated successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

export default router;
