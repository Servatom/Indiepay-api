import mongoose from "mongoose";
import { IProject, Project } from "../models/project";
import {
  ITransaction,
  TNewTransaction,
  Transaction,
} from "../models/transaction";
import { TTransactionStatus } from "../../utils/types";

export const transactionService = {
  addTransaction: async (
    transaction: TNewTransaction,
    projectID: string
  ): Promise<ITransaction | unknown> => {
    try {
      const newTransaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        projectID: projectID,
        userVPA: transaction.userVPA,
        amount: transaction.amount,
        currency: transaction.currency,
        status: "PENDING",
        metadata: transaction.metadata,
        timestamp: new Date(),
      });
      const result: ITransaction = await newTransaction.save();
      return result;
    } catch (err) {
      console.log(err);
      return err;
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

  updateTransactionStatus: async (
    transactionID: string,
    status: TTransactionStatus
  ) => {
    try {
      const result = await Transaction.findOneAndUpdate(
        { _id: transactionID },
        { status: status },
        { new: true }
      );
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
