// import { Document, model, Schema, Types } from "mongoose";

// export interface LeaveBalance {
//   employeeId: Types.ObjectId;
//   leave: number;
//   extraLeave: number;
//   usedLeave: number;
//   isActive: boolean;
//   isDeleted: boolean;
// }

// export interface LeaveBalanceDocument extends LeaveBalance, Document {}

// export const LeaveBalanceSchema = new Schema<LeaveBalanceDocument>(
//   {
//     employeeId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },

//     leave: {
//       type: Number,
//     },
//     extraLeave: {
//       type: Number,
//       default: 0,
//     },
//     usedLeave: {
//       type: Number,
//       default: 0,
//     },
//     isActive: { type: Boolean, default: true },
//     isDeleted: { type: Boolean, default: false },
//   },
//   { timestamps: true, versionKey: false }
// );

// export const LeaveBalance = model<LeaveBalanceDocument>(
//   "LeaveBalance",
//   LeaveBalanceSchema
// );
import { Document, model, Schema, Types } from "mongoose";

export interface LeaveHistory {
  month: string;  // e.g., "July"
  year: number;   // e.g., 2025
  paidLeaveUsed: number;   // Total paid leaves used in that month
  unpaidLeaveUsed: number; // Total unpaid leaves (salary deduction)
}

export interface LeaveBalance {
  employeeId: Types.ObjectId;
  leave: number;             // Remaining paid leaves
  usedLeave: number;         // Lifetime used paid leaves
  leaveHistory: LeaveHistory[];
  isActive: boolean;
  isDeleted: boolean;
}

export interface LeaveBalanceDocument extends LeaveBalance, Document { }

export const LeaveBalanceSchema = new Schema<LeaveBalanceDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leave: {
      type: Number,
      default: 0,
    },
    usedLeave: {
      type: Number,
      default: 0,
    },
    leaveHistory: [
      {
        month: { type: String, required: true },
        year: { type: Number, required: true },
        paidLeaveUsed: { type: Number, default: 0 },
        unpaidLeaveUsed: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const LeaveBalance = model<LeaveBalanceDocument>(
  "LeaveBalance",
  LeaveBalanceSchema
);

