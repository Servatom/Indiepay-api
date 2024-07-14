import mongoose from "mongoose";
import { IProject, Project, TNewProject } from "../models/project";

export const projectService = {
  createProject: async (project: TNewProject): Promise<IProject | unknown> => {
    try {
      const newProject = new Project({
        _id: new mongoose.Types.ObjectId(),
        name: project.name,
        ownerID: project.ownerID,
        webhookURL: project.webhookURL,
        callbackURL: project.callbackURL,
        vpa: project.vpa,
        totalRevenue: 0,
      });

      const result: IProject = await newProject.save();
      return result;
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  getProject: async (projectID: string): Promise<IProject | null> => {
    try {
      const result = await Project.findOne({ _id: projectID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  getProjectsByOwnerID: async (ownerID: string): Promise<IProject[] | null> => {
    try {
      const result = await Project.find({ ownerID: ownerID });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  updateProject: async (
    projectID: string,
    project: IProject
  ): Promise<IProject | null> => {
    try {
      const result = await Project.findOneAndUpdate(
        { _id: projectID },
        project,
        {
          new: true,
        }
      );
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  deleteProject: async (projectID: string): Promise<boolean> => {
    try {
      await Project.deleteOne({
        _id: projectID,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
