import fs from "fs";
import path from "path";
import { Role } from "./models/role.model";
import { User } from "./models/user.model";

import bcrypt from "bcrypt";
const filePath = path.join(__dirname, "seeds", "role.json");
const filePathOfAdmin = path.join(__dirname, "seeds", "admin.json");

const createrole = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const adminInfo = JSON.parse(fs.readFileSync(filePathOfAdmin, "utf-8"));
export const seedRole = async () => {
  try {
    const roleData = await Role.find();
    if (roleData.length === 0) {
      await Role.create(createrole);
    } else {
      console.log("Role exist");
    }
  } catch (error: any) {
    return error.message;
  }
};

export const createAdminUser = async () => {
  try {
    const adminRole: any = await Role.findOne({
      role: "ADMIN",
      isDeleted: false,
    });


    const existingAdmin = await User.findOne({ email: adminInfo.email });
    if (existingAdmin) {
      console.log("admin already exist");
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminInfo.password, salt);
    await User.create({
      ...adminInfo,
      password: hashedPassword,
      role: adminRole._id,
    });
  } catch (error: any) {
    return error.message;
  }
};
