import mongoose from "mongoose";
import { IWebhook, TNewWebhook, Webhook } from "../models/webhook";

export const webhookService = {
  addWebhook: async (webhook: TNewWebhook): Promise<IWebhook | unknown> => {
    try {
      const newWebhook = new Webhook({
        _id: new mongoose.Types.ObjectId(),
        ...webhook,
      });
      const result: IWebhook = await newWebhook.save();
      return result;
    } catch (err) {
      console.log(err);
      return err;
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
};
