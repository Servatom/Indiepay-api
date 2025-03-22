import mongoose from "mongoose";
import {
  ITransaction,
  INewTransaction,
  Transaction,
} from "../models/transaction";
import { TTransactionStatus } from "../../utils/types";
import {
  INewTransactionRequest,
  ITransactionRequest,
  TransactionRequest,
} from "../models/transactionRequest";
import { IProject, Project } from "../models/project";
// import { jobOptions, webhookQueue } from "../../queue";
import { webhookService } from "./webhook";
import { IWebhook } from "../models/webhook";

export const transactionService = {
  addTransaction: async (
    transaction: INewTransaction,
    projectID: string,
    ownerID: string
  ): Promise<ITransaction | unknown> => {
    try {
      const newTransaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        ownerID: ownerID,
        projectID: projectID,
        upiRefID: transaction.upiRefID,
        userVPA: transaction.userVPA,
        amount: transaction.amount,
        currency: transaction.currency,
        status: "PENDING",
        metadata: transaction.metadata,
        timestamp: transaction.timestamp ? transaction.timestamp : new Date(),
      });
      const result: ITransaction = await newTransaction.save();
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getTransaction: async (
    transactionID: string
  ): Promise<ITransaction | null> => {
    try {
      const result = await Transaction.findOne({ _id: transactionID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  getTransactionsByProject: async (
    projectID: string
  ): Promise<ITransaction[] | null> => {
    try {
      const result = await Transaction.find({ projectID: projectID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  getTransactionsByUser: async (
    userID: string
  ): Promise<ITransaction[] | null> => {
    try {
      const result = await Transaction.find({ ownerID: userID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  updateTransactionStatus: async (
    ownerID: string,
    transactionID: string,
    status: TTransactionStatus
  ) => {
    try {
      const result = await Transaction.findOneAndUpdate(
        { _id: transactionID, ownerID: ownerID },
        { status: status },
        { new: true }
      );

      if (!result) {
        return new Error("Transaction not found");
      }
      // add webhook item to redis queue here

      // find project with projectID from transaction
      const project = await Project.findOne({ _id: result.projectID });
      if (!project) {
        return new Error("Project not found");
      }

      if (project.webhookURL) {
        const webhook = await webhookService.addWebhook({
          projectID: project._id,
          status: "PENDING",
          transactionData: result,
          url: project.webhookURL,
          createdAt: new Date(),
        });

        if (!webhook) {
          return new Error("Webhook could not be triggered");
        }

        const redisQueueItem = {
          url: project.webhookURL,
          payload: result,
          webhookID: webhook._id,
        };

        // await webhookQueue.add("webhookJob", redisQueueItem, jobOptions);
      }

      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /** ----------------- Transaction Request ----------------- */

  createTransactionRequest: async (
    transactionRequestData: INewTransactionRequest,
    project: IProject
  ) => {
    try {
      const existingTransactionRequest = await TransactionRequest.findOne({
        projectID: project._id,
        "productInfo.id": transactionRequestData.productInfo.id,
        status: "UNUSED",
      });

      if (existingTransactionRequest) {
        return existingTransactionRequest;
      }

      const newTransactionRequest = new TransactionRequest({
        _id: new mongoose.Types.ObjectId(),
        ownerID: project.ownerID,
        projectID: project._id,
        merchantVPA: project.vpa,
        amount: transactionRequestData.amount,
        currency: transactionRequestData.currency,
        productInfo: transactionRequestData.productInfo,
        metadata: transactionRequestData.metadata,
        status: "UNUSED",
      });

      const result = await newTransactionRequest.save();
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  findTransactionRequest: async (
    transactionRequestID: string
  ): Promise<ITransactionRequest | null> => {
    try {
      const result = await TransactionRequest.findOne({
        _id: transactionRequestID,
      });
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  markTransactionRequestUsed: async (
    transactionRequestID: string
  ): Promise<ITransactionRequest | null> => {
    try {
      const result = await TransactionRequest.findOneAndUpdate(
        { _id: transactionRequestID },
        { status: "USED" },
        { new: true }
      );
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
