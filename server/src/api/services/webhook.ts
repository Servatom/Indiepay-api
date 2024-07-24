import mongoose from "mongoose";
import { IWebhook, INewWebhook, Webhook } from "../models/webhook";
import { TWebhookStatus } from "../../utils/types";

export const webhookService = {
  addWebhook: async (webhook: INewWebhook): Promise<IWebhook | null> => {
    try {
      const newWebhook = new Webhook({
        _id: new mongoose.Types.ObjectId(),
        ...webhook,
      });
      const result: IWebhook = await newWebhook.save();
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getWebhooksByProjectID: async (
    projectID: string
  ): Promise<IWebhook[] | null> => {
    try {
      const result = await Webhook.find({ projectID: projectID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  updateWebhookStatus: async (
    webhookID: string,
    status: TWebhookStatus,
    deliveredAt?: Date
  ): Promise<IWebhook | null> => {
    try {
      const result = await Webhook.findOneAndUpdate(
        { _id: webhookID },
        { status: status, deliveredAt: deliveredAt }
      );
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
