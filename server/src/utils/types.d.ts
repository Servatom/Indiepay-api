import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userData?: {
    userID: string;
    phoneNumber: string;
    firebaseUID: string;
  };
}

export interface CustomError extends Error {
  status?: number;
}

export type TCurrency = "INR" | "USD" | "EUR";
export type TTransactionStatus = "accepted" | "pending" | "rejected";
