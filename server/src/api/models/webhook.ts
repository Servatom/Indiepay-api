import mongoose, { Document, Schema } from "mongoose";
import { TWebhookStatus } from "../../utils/types";
import { ITransaction } from "./transaction";

interface INewWebhook {
  projectID: string;
  status: TWebhookStatus;
  transactionData: ITransaction;
  url: string;
  createdAt: Date;
  deliveredAt?: Date;
}

interface IWebhook extends Document, INewWebhook {}

const webhookScheme: Schema<IWebhook> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  projectID: { type: String, required: true, ref: "Project" },
  status: { type: String, required: true, default: "PENDING" },
  url: { type: String, required: true },
  transactionData: { type: Object, required: true },
  createdAt: { type: Date, required: true, default: new Date() },
  deliveredAt: { type: Date, required: false },
});

const Webhook = mongoose.model<IWebhook>("Webhook", webhookScheme);

export { Webhook, IWebhook, INewWebhook };
