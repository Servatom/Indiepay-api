import { Request } from "express";
import { AuthenticatedRequest, TRecordType } from "../../utils/types";
import { IUser } from "../models/user";

export interface LoginRequest extends Request {
  body: {
    token: string;
    email: string;
    provider: string;
    displayName: string;
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

/* -------------- Project   -------------- */
export interface CreateProjectRequest extends AuthenticatedRequest {
  body: {
    appName: string;
    webhookURL: string;
    callbackURL?: string;
    vpa: string;
  };
}

export interface UpdateProjectRequest extends AuthenticatedRequest {
  body: IProject;
}
