import { Document, Types, Schema, model, Double } from "mongoose";

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface UserDetails {
  userId: Types.ObjectId;
  managerId: Types.ObjectId;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: string;
  image: string;
  permenentAddress: Address;
  currentAddress: Address;
  joiningDate: Date;
  probationDate: Date;
  panNo: string;
  aadharNo: string;
  personalNumber: string;
  currentSalary: number;
  previousExperience: Number;
  pfNo: string;
  uanDetail: string;
  teamId: Types.ObjectId;
  designationId: Types.ObjectId;
  department: Types.ObjectId;
  primarySkills: [Types.ObjectId];
  secondarySkills: [Types.ObjectId];
  bankDetails: BankDetails;
  isDeleted: boolean;
  relieivingDate: Date;
}

export interface UserDetailsDocument extends UserDetails, Document { }

const userDetailSchema = new Schema<UserDetailsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    image: {
      type: String
    },
    countryCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },

    personalNumber: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
    },

    permenentAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zip: { type: String },
    },
    currentAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zip: { type: String },
    },
    joiningDate: {
      type: Date,
    },
    probationDate: {
      type: Date,
    },
    panNo: {
      type: String,
    },
    aadharNo: {
      type: String,
    },
    currentSalary: {
      type: Number,
    },
    previousExperience: {
      type: Number,
    },
    pfNo: {
      type: String,
    },
    uanDetail: {
      type: String,
    },

    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    relieivingDate: {
      type: Date,
    },
    primarySkills: {
      type: [Schema.Types.ObjectId],
      ref: "Skill",
    },
    secondarySkills: {
      type: [Schema.Types.ObjectId],
      ref: "Skill",
    },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      branchName: { type: String },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserDetails = model<UserDetailsDocument>(
  "UserDetails",
  userDetailSchema
);
