import { Document, model, Schema } from "mongoose";

export interface Holiday {
  label: string;
  date: Date
}

export interface HolidayDocument extends Holiday, Document {}

const holidaySchema = new Schema<HolidayDocument>(
  {
    label: {
      required: true,
      type: String,
      
    },
    date : {
      type:Date,
      required : true
    }
  },
  { timestamps: true, versionKey: false }
);

export const Holiday = model<HolidayDocument>("Holidays",holidaySchema);
