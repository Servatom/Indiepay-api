import express, { NextFunction, Request, Response } from "express";
import { INewTransaction } from "../models/transaction";
import { transactionService } from "../services/transaction";
import { projectService } from "../services/project";
import checkSDKCreds from "../middleware/check-sdk-creds";
import {
  CreateSDKTransactionRequest,
  PostSDKTransactionRequest,
} from "./types";

const router = express.Router();

router.get(
  "/:transactionRequestID",
  async (req: Request, res: Response, next: NextFunction) => {
    const transactionRequestID = req.params.transactionRequestID;

    try {
      // find the transaction request in the database
      const transactionRequest =
        await transactionService.findTransactionRequest(transactionRequestID);
      if (!transactionRequest) {
        return res.status(401).json({
          message: "Invalid transaction request",
        });
      }
      return res.status(201).json({
        message: "Transaction Request found!",
        data: transactionRequest,
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

router.post(
  "/initiateTransaction/:projectID",
  checkSDKCreds,
  async (
    req: CreateSDKTransactionRequest,
    res: Response,
    next: NextFunction
  ) => {
    const userID = req.userID!;
    const projectID = req.params.projectID;
    const { amount, currency, productInfo, metadata } = req.body;

    try {
      const project = await projectService.getProject(projectID);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      if (project.ownerID !== userID) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const result = await transactionService.createTransactionRequest(
        req.body,
        project
      );
      return res.status(201).json({
        message: "Transaction request initiated successfully",
        data: result._id,
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

router.post(
  "submitTransaction/:transactionRequestID",
  async (req: PostSDKTransactionRequest, res: Response, next: NextFunction) => {
    const { upiRefID, userVPA, timestamp } = req.body;
    const transactionRequestID = req.params.transactionRequestID;

    try {
      const transactionRequest =
        await transactionService.findTransactionRequest(transactionRequestID);
      if (!transactionRequest) {
        return res.status(401).json({
          message: "Invalid transaction request",
        });
      }

      if (transactionRequest.status === "UNUSED") {
        return res.status(400).json({
          message: "Transaction request already used",
        });
      }

      const newTransaction: INewTransaction = {
        upiRefID,
        userVPA,
        amount: transactionRequest.amount,
        currency: transactionRequest.currency,
        metadata: transactionRequest.metadata,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      };

      const result = await transactionService.addTransaction(
        newTransaction,
        transactionRequest.projectID,
        transactionRequest.ownerID
      );
      if (!result) {
        return res.status(500).json({
          message: "Internal server error",
        });
      }

      transactionRequest.status = "USED";
      await transactionRequest.save();

      return res.status(201).json({
        message: "Transaction created successfully",
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
