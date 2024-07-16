import mongoose, { Document, Schema } from "mongoose";
import { TCurrency, TTransactionStatus } from "../../utils/types";

interface INewTransaction {
  upiRefID: string;
  userVPA: string;
  amount: number;
  currency: TCurrency;
  metadata: {
    [key: string]: any;
  };
  timestamp: Date;
}
interface ITransaction extends Document, INewTransaction {
  status: TTransactionStatus;
  ownerID: string;
  projectID: string;
}

const transactionScheme: Schema<ITransaction> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ownerID: { type: String, required: true, ref: "User" },
  projectID: { type: String, required: true, ref: "Project" },
  upiRefID: { type: String, required: true },
  userVPA: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true, default: "PENDING" },
  metadata: { type: Object, required: true },
  timestamp: { type: Date, required: true },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionScheme
);

export { Transaction, ITransaction, INewTransaction };
