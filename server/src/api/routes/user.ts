import express, { NextFunction, Response } from "express";
import { User } from "../models/user";
import { userService } from "../services/user";
import checkAuth from "../middleware/check-auth";
import { AuthResponse, LoginRequest, UpdateUserRequest } from "./types";
import { AuthenticatedRequest } from "../../utils/types";

const router = express.Router();

router.post(
  "/login",
  async (req: LoginRequest, res: Response, next: NextFunction) => {
    const { email, firebaseUID } = req.body;
    // check if user exists in db with phoneNumber and firebaseUID combination
    // if not, create new user
    // return jwt
    // if user exists, return jwt

    try {
      const result = (await userService.loginUser(
        email,
        firebaseUID
      )) as AuthResponse | null;

      if (!result) {
        const newUser = (await userService.createUser(
          email,
          firebaseUID
        )) as AuthResponse;
        if (newUser) {
          return res.status(201).json({
            message: "User created",
            token: newUser.token,
            user: newUser.user,
          });
        }
      } else {
        return res.status(200).json({
          message: "User found",
          token: result.token,
          user: result.user,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }
  }
);

router.get(
  "/",
  checkAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!.userID;
    try {
      const result = await userService.getUser(userID);
      if (result) {
        return res.status(200).json({
          message: "User found",
          user: result,
        });
      } else {
        return res.status(404).json({
          message: "User not found",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }
  }
);

router.patch(
  "/update",
  checkAuth,
  async (req: UpdateUserRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!.userID;

    const doc = await User.findOneAndUpdate({ _id: userID }, req.body, {
      new: true,
    })
      .then((result) => {
        res.status(200).json({
          message: "Data updated",
          user: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error",
          error: err,
        });
      });
  }
);

router.post(
  "/waitlist",
  checkAuth,
  async (req: UpdateUserRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!.userID;
    const onWaitlist = req.body.onWaitlist;

    try {
      const result = await userService.updateWaitlistStatus(userID, onWaitlist);
      if (result) {
        return res.status(200).json({
          message: "Waitlist status updated",
          user: result,
        });
      } else {
        return res.status(404).json({
          message: "User not found",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }
  }
);

router.post(
  "/verify",
  checkAuth,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: "User verified",
    });
  }
);

export default router;
