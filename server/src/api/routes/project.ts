import express, { NextFunction, Response } from "express";
import checkAuth from "../middleware/check-auth";
import { projectService } from "../services/project";
import { AuthenticatedRequest } from "../../utils/types";
import { CreateProjectRequest, UpdateProjectRequest } from "./types";
import { TNewProject } from "../models/project";

const router = express.Router();

router.post(
  "/",
  checkAuth,
  async (req: CreateProjectRequest, res: Response, next: NextFunction) => {
    const { appName, webhookURL, callbackURL, vpa } = req.body;
    const newProject: TNewProject = {
      name: appName,
      ownerID: req.userData!._id,
      webhookURL: webhookURL,
      callbackURL: callbackURL,
      vpa: vpa,
      totalRevenue: 0,
    };

    console.log(newProject);
    try {
      const result = await projectService.createProject(newProject);
      return res.status(201).json({
        message: "Project created successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.get(
  "/:projectID",
  checkAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    const projectID = req.params.projectID;
    try {
      const result = await projectService.getProject(projectID);
      if (!result) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      if (result.ownerID !== userID) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }
      return res.status(200).json({
        message: "Project fetched successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.get(
  "/all",
  checkAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    try {
      const result = await projectService.getProjectsByOwnerID(userID);
      return res.status(200).json({
        message: "Projects fetched successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

router.put(
  "/:projectID",
  checkAuth,
  async (req: UpdateProjectRequest, res: Response, next: NextFunction) => {
    const userID = req.userData!._id;
    const projectID = req.params.projectID;
    try {
      const result = await projectService.updateProject(projectID, req.body);
      if (!result) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      return res.status(200).json({
        message: "Project updated successfully",
        data: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error",
        error: err,
      });
    }
  }
);

export default router;
