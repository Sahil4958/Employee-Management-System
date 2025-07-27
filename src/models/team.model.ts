import { Document, Schema, model, Types } from "mongoose";

export interface Team {
  managerId: Types.ObjectId;
  label: String;
  value: string;
}

export interface TeamDocument extends Team, Document {}

const teamSchema = new Schema<TeamDocument>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique:true
    },
    label: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Team = model<TeamDocument>("Team", teamSchema);
