import { Document, model, Schema, Types } from "mongoose";

export interface Salary {
  employeeId: Types.ObjectId;
  netSalary: number;
  leaveDeducation: number;
  generatedAt: Date;
  month: string;
  extraLeave: number;
  isActive?: boolean;
  isDeleted?: boolean;
}
export interface SalaryDocument extends Salary, Document {}

const salarySchema = new Schema<SalaryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    netSalary: {
      type: Number,
    },
    leaveDeducation: {
      type: Number,
    },

    generatedAt: {
      type: Date,
    },
    month: {
      type: String,
    },

    extraLeave: {
      type: Number,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Salary = model<SalaryDocument>("Salary", salarySchema);
