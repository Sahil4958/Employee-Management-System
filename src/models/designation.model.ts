import { Document, model, Schema } from "mongoose";

export interface Designation {
  label: string;
}

export interface DesignationDocument extends Designation, Document {}

const designationSchema = new Schema<DesignationDocument>(
  {
    label: {
      required: true,
      type: String,
      unique:true
    },
  },
  { timestamps: true, versionKey: false }
);

export const Designation = model<DesignationDocument>("Designation",designationSchema);
