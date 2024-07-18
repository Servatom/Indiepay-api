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
import { IProject } from "../models/project";

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

      // add webhook item to redis queue here

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
