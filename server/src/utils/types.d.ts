import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { IUser } from "../api/models/user";

export interface AuthenticatedRequest extends Request {
  userData?: IUser;
}

export interface SDKRequest extends Request {
  userID?: string;
}

export interface CustomError extends Error {
  status?: number;
}

export type TCurrency = "INR";
export type TTransactionStatus = "ACCEPTED" | "PENDING" | "REJECTED";
export type TTransactionRequestStatus = "USED" | "UNUSED";
export type TWebhookStatus = "SUCCESS" | "FAILURE" | "PENDING";
export type TIntegratoionType = "Slack" | "Discord";

export type TDashboardStats = {
  totalApps: number;
  totalOrders: number;
  totalRevenue: number;
  apps: TAppStat[];
};

export type TAppStat = {
  _id: string;
  name: string;
  pendingOrders: number;
  totalOrders: number;
  revenue: number;
};

export type TSDKProduct = {
  id: string;
  title: string;
  description: string;
};
