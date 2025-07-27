import { AnyBulkWriteOperation, Document, model, Schema, Types } from "mongoose";

export interface Leave {
  employeeId: Types.ObjectId;
  startDate: Date;
  start_leave_type: string;
  // start_leave_half_type: string;
  endDate: Date;
  end_leave_type: string;
  // end_leave_half_type: string;
  totalDays: number;
  status: string;
  comments: string;
  approveId: Types.ObjectId;
  approveById: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
}

export interface LeaveDocument extends Leave, Document { }

const leaveSchema = new Schema<LeaveDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    startDate: {
      type: Date,
    },
    start_leave_type: {
      type: String,
      enum: ['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']
    },
    // start_leave_half_type: {
    //   type: String,
    //   enum: ['FIRST_HALF', 'SECOND_HALF']
    // },
    endDate: {
      type: Date,
    },
    end_leave_type: {
      type: String,
      enum: ['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']
    },
    // end_leave_half_type: {
    //   type: String,
    //   enum: ['FIRST_HALF', 'SECOND_HALF']
    // },
    totalDays: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECT'],
      default: 'PENDING'
    },
    comments: {
      type: String,
    },
    approveId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approveById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);


export const Leave = model<LeaveDocument>("Leave", leaveSchema);