import mongoose, { Document, Schema } from "mongoose";
import { TCurrency, TTransactionStatus } from "../../utils/types";

interface ITransaction extends Document {
  projectID: string;
  userVPA: string;
  amount: number;
  currency: TCurrency;
  status: TTransactionStatus;
  metadata: {
    [key: string]: string;
  };
  timestamp: Date;
}

const transactionScheme: Schema<ITransaction> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  projectID: { type: String, required: true, ref: "Project" },
  userVPA: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  metadata: { type: Object, required: true },
  timestamp: { type: Date, required: true },
});

const Transaction = mongoose.model<ITransaction>("User", transactionScheme);

export { Transaction, ITransaction };
