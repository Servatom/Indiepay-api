import mongoose, { Document, Schema } from "mongoose";

interface TNewProject {
  name: string;
  ownerID: string;
  webhookURL?: string;
  callbackURL?: string;
  vpa: string;
  totalRevenue: number;
}

interface IProject extends Document, TNewProject {}

const projectScheme: Schema<IProject> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  ownerID: { type: String, required: true, ref: "User" },
  webhookURL: { type: String, required: false },
  callbackURL: { type: String, required: false },
  vpa: { type: String, required: true },
  totalRevenue: { type: Number, required: true, default: 0 },
});

const Project = mongoose.model<IProject>("Project", projectScheme);

export { Project, IProject, TNewProject };
