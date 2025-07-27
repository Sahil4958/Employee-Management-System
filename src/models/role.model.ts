import { Document, model, Schema } from "mongoose";

export interface Role {
role: string;
isDeleted: boolean;
}

export interface RoleDocument extends Role, Document {}

const roleSchema = new Schema<RoleDocument>(
  {
    role: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default:false
    },
  },
  { timestamps: true}
);

export const Role = model<RoleDocument>("Role", roleSchema);
