import { Request } from "express";
import { AuthenticatedRequest, TRecordType } from "../../utils/types";
import { IUser } from "../models/user";

export interface LoginRequest extends Request {
  body: {
    email: string;
    firebaseUID: string;
  };
}

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface UpdateUserRequest extends AuthenticatedRequest {
  body: IUser;
}

export interface CreatePlanRequest extends AuthenticatedRequest {
  body: IPlan;
}

export interface CreateRecordRequest extends AuthenticatedRequest {
  body: {
    name: string;
    content: string;
    type: TRecordType;
    planID: string;
    domainID: string;
  };
}
