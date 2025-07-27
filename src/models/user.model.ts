import { Document, Schema, Types, model } from "mongoose";

export interface User {
  password: string;
  role: Types.ObjectId;
  email: string;
  image: string;
  personalEmail: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isDeleted: boolean;
  employeeId: string;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,

      lowercase: true,
    },
    personalEmail: {
      type: String,

      lowercase: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
    },
    image: {
      type: String,
    },
    role: {
      ref: "Role",
      type: Schema.Types.ObjectId,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    versionKey: false,
    autoIndex: false,
  }
);

export const User = model<UserDocument>("User", userSchema);
