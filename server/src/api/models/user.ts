import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  firebaseUID: string;
  onWaitlist: boolean;
  isActive: boolean;
  defaultVPA: string;
  provider: string;
  displayName: string;
}

const userScheme: Schema<IUser> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  // authToken: { type: String, required: true },
  firebaseUID: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  onWaitlist: { type: Boolean, required: true, default: false },
  isActive: { type: Boolean, required: true, default: true },
  defaultVPA: { type: String, required: true, default: "X" },
  provider: { type: String, required: true },
  displayName: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", userScheme);

export { User, IUser };
