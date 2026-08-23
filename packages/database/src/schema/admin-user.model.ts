import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IAdminUser extends Document {
  _id: Types.ObjectId;
  username: string;
  passwordHash: string;
  role: "moderator" | "admin" | "super_admin";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      minlength: 3,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["moderator", "admin", "super_admin"],
      default: "moderator",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const AdminUser = mongoose.model<IAdminUser>(
  "AdminUser",
  adminUserSchema
);
