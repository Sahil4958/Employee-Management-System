import { Document, model, Schema } from "mongoose";

export interface Department {
  label: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface DepartmentDocument extends Department, Document {}

const DepartmentSchema = new Schema<DepartmentDocument>(
  {
    label: {
      required: true,
      type: String,
      unique: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Department = model<DepartmentDocument>(
  "Department",
  DepartmentSchema
);
