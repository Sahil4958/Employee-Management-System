import { Document, model, Schema, Types } from "mongoose";

export interface Skill {
  label: string;
  value: string;
}

export interface SkillDocument extends Skill, Document {}

const skillSchema = new Schema<SkillDocument>(
  {
    label: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Skill = model<SkillDocument>("Skill", skillSchema);
