import mongoose, { Document, Schema } from "mongoose";
import {
  TCurrency,
  TSDKProduct,
  TTransactionRequestStatus,
} from "../../utils/types";

interface INewTransactionRequest {
  amount: number;
  currency: TCurrency;
  productInfo: TSDKProduct;
  metadata?: {
    [key: string]: any;
  };
}
interface ITransactionRequest extends Document, INewTransactionRequest {
  ownerID: string;
  projectID: string;
  merchantVPA: string;
  status: TTransactionRequestStatus;
  createdAt?: Date;
}

const transactionRequestScheme: Schema<ITransactionRequest> =
  new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ownerID: { type: String, required: true, ref: "User" },
    projectID: { type: String, required: true, ref: "Project" },
    merchantVPA: { type: String, required: true },
    status: { type: String, required: true, default: "UNUSED" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    metadata: { type: Object, required: false },
    productInfo: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  });

const TransactionRequest = mongoose.model<ITransactionRequest>(
  "TransactionRequest",
  transactionRequestScheme
);

export { TransactionRequest, ITransactionRequest, INewTransactionRequest };
