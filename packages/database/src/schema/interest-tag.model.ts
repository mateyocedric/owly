import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IInterestTag extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

const interestTagSchema = new Schema<IInterestTag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const InterestTag = mongoose.model<IInterestTag>(
  "InterestTag",
  interestTagSchema
);
