import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  authToken: string;
  firebaseUID: string;
  onWaitlist: boolean;
  isActive: boolean;
  defaultVPA: string;
}

const userScheme: Schema<IUser> = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  authToken: { type: String, required: true },
  firebaseUID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  onWaitlist: { type: Boolean, required: true, default: false },
  isActive: { type: Boolean, required: true, default: true },
  defaultVPA: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", userScheme);

export { User, IUser };
