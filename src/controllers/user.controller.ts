import { User } from "../models/user.model";
import { registerSchema, loginSchema, resetPasswordLink, resetPassword } from "../utils/zod";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { apiResponse } from "../utils/apiResponses";
import { messages } from "../utils/messages";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { UserDetails } from "../models/userDetails.model";
import { Types } from "mongoose";
import { Cloudinary } from "../utils/cloudinary";
import { Role } from "../models/role.model";

import { paginationObject } from "../utils/pagination";
import { LeaveBalance } from "../models/leaveBalance.models";
import sendEmail from "../helpers/sendEmail";
import { Token } from "../models/token.model";
import crypto from "crypto";
import dotenv from 'dotenv'
import { Leave } from "../models/leave.model";
dotenv.config()

export const createUser = async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.parse(req.body);
    const { email, password } = parseResult;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.EXISTING_USER);
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    const finalData = {
      ...parseResult,
      password: hashedPassword,
      joiningDate: new Date(),
    };

    const currentMonth = moment().month();
    const remainingMonths = 12 - currentMonth;
    const monthlyLeave = 1;
    const totalLeave = remainingMonths * monthlyLeave;

    const user = await User.create(finalData);
    await LeaveBalance.create({
      leave: totalLeave,
      employeeId: user?._id,
    });

    await UserDetails.create({ userId: user?._id });
    if (user) {
      apiResponse(res, StatusCodes.CREATED, messages.USER_REGISTERED, {
        email: user?.email,
        role: user?.role,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.parse(req.body);
    const { email, password } = parseResult;

    const user: any = await User.findOne({ email: email }).populate("role");
    if (!user) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
      return;
    }

    const comparedPassword = await bcrypt.compare(password, user.password);
    if (!comparedPassword) {
      apiResponse(res, StatusCodes.UNAUTHORIZED, messages.INCORRECT_PASSWORD);
    }

    const accessToken = jwt.sign(
      {
        email: user.email,
        role: user.role,
        id: user._id,
      },
      process.env.JWT_SECRETKEY!,
      { expiresIn: "7d" }
    );

    apiResponse(res, StatusCodes.OK, messages.USER_LOGIN_SUCCESS, {
      token: accessToken,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      role: user?.role?.role,
      userId: user?._id,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const generateEmployeeId = async () => {
  const lastUser = await User.findOne().sort({ createdAt: -1 });
  const lastNumber = lastUser?.employeeId?.match(/\d+/)?.[0] || "0";
  const newNumber = String(Number(lastNumber) + 1).padStart(3, "0");
  return `EMP${newNumber}`;
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const safeAssign = (target: any, source: any) => {
  for (const key in source) {
    if (
      source[key] !== undefined &&
      source[key] !== null &&
      (typeof source[key] !== "string" || source[key].trim() !== "") &&
      (!Array.isArray(source[key]) || source[key].length > 0)
    ) {
      target[key] = source[key];
    }
  }
};

export const userCreate = async (req: Request, res: Response) => {
  try {
    const { step } = req.body;
    const stepNumber = parseInt(step);

    if (![1, 2, 3, 4].includes(stepNumber)) {
      return handleError(res, { message: "Invalid step" });
    }

    let user;
    let userId = req.body.userId;
    // Step 1: Create User and UserDetails
    if (stepNumber === 1) {
      const {
        firstName,
        lastName,
        email,
        personalEmail,
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
        role,
        dateOfBirth,
        gender,
      } = req.body;

      if (!req.file) {
        return handleError(res, { message: "Image is required" });
      }
      const existingUser = await User.findOne({ email: email });
      let roledata = await Role.findById({ _id: role }).select('role')

      if (existingUser) {
        return apiResponse(
          res,
          StatusCodes.BAD_REQUEST,
          messages.EXISTING_USER
        );
      }
      const file = req.file as Express.Multer.File;
      const uploadResult = await Cloudinary.uploadToCloudinary(
        file,
        "employee_management"
      );
      let parsePermententAddress: any;
      if (typeof permenentAddress === "string") {
        parsePermententAddress = JSON.parse(permenentAddress);
      } else {
        parsePermententAddress = permenentAddress;
      }
      let parseCurrentAddress: any;
      if (typeof currentAddress === "string") {
        parseCurrentAddress = JSON.parse(currentAddress);
      } else {
        parseCurrentAddress = currentAddress;
      }
      const rawPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const employeeId = await generateEmployeeId();

      user = new User({
        firstName,
        lastName,
        role,
        email,
        personalEmail,
        password: hashedPassword,
        image: uploadResult.secure_url,
        employeeId,
      });

      const savedUser = await user.save();
      await sendEmail({
        email: email,
        subject: "Welcome to Employee Management System",
        message: `
    <h2>Welcome ${savedUser.firstName} ${savedUser.lastName},</h2>
    <p>Your account has been successfully created.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${rawPassword}</p>
    <br/>
    <p>Please login it via provided credential</p>
  `,
      });

      const userDetails = new UserDetails({
        userId: savedUser._id,
        phoneNumber,
        personalNumber,
        currentAddress: parseCurrentAddress,
        permenentAddress: parsePermententAddress,
        dateOfBirth,
        gender,
      });

      await userDetails.save();

      return apiResponse(res, StatusCodes.CREATED, "Step 1 completed", {
        userId: savedUser._id,
        email: savedUser.email,
        employeeId: savedUser.employeeId,
        roledata
      });
    }

    // Steps 2–4: Update UserDetails only
    if (!userId) {
      return handleError(res, { message: "userId is required for steps 2–4" });
    }

    const userDetailsUpdate: any = {};

    if (stepNumber === 2) {
      const {
        managerId,
        designationId,
        teamId,
        secondarySkills,
        primarySkills,
        department,
      } = req.body;

      let parsePrimarySkills: any;
      let parseSecondarySkills: any;

      if (typeof primarySkills === "string") {
        parsePrimarySkills = JSON.parse(primarySkills);
      } else {
        parsePrimarySkills = primarySkills;
      }
      if (typeof secondarySkills === "string") {
        parseSecondarySkills = JSON.parse(secondarySkills);
      } else {
        parseSecondarySkills = secondarySkills;
      }
    

      safeAssign(userDetailsUpdate, {
        managerId,
        designationId,
        teamId,
        secondarySkills: parsePrimarySkills,
        primarySkills: parseSecondarySkills,
        department,
      });
    }

    if (stepNumber === 3) {
      const {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
        currentSalary,
      } = req.body;

      safeAssign(userDetailsUpdate, {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
        currentSalary,
      });

      const user = await User.findById(userId);
      if (!user) {
        return handleError(res, {
          message: "User not found for leave balance",
        });
      }

      const joinMonth = moment(joiningDate).month();
      const remainingMonths = 12 - (joinMonth + 1);
      const monthlyLeave = 1;
      const totalLeave = remainingMonths * monthlyLeave;

      const existingLeave = await LeaveBalance.findOne({
        employeeId: user._id,
      });

      if (!existingLeave) {
        await LeaveBalance.create({
          leave: totalLeave,
          employeeId: user._id,
          extraLeave: 0,
        });
      } 
    }

    if (stepNumber === 4) {
      const { bankDetails } = req.body;

      let parseBankDetails: any = {};
      if (typeof bankDetails === "string") {
        parseBankDetails = JSON.parse(bankDetails);
      } else {
        parseBankDetails = bankDetails;
      }

      safeAssign(userDetailsUpdate, { bankDetails: parseBankDetails });
    }

    await UserDetails.findOneAndUpdate(
      { userId: userId },
      { $set: userDetailsUpdate },
      { new: true }
    );

    return apiResponse(res, StatusCodes.OK, `Step ${stepNumber} completed`, {
      userId,
    });
  } catch (error) {
    console.log("error in email", error);
    handleError(res, error);
  }
};

export const getUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const userWithDetails = await User.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(userId),
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: {
          path: "$roleDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Manager
      {
        $lookup: {
          from: "users",
          localField: "userDetails.managerId",
          foreignField: "_id",
          as: "userDetails.manager",
          pipeline: [{ $project: { _id: 1, lastName: 1, firstName: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$userDetails.manager",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Designation
      {
        $lookup: {
          from: "designations",
          localField: "userDetails.designationId",
          foreignField: "_id",
          as: "userDetails.designation",
          pipeline: [{ $project: { _id: 1, label: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$userDetails.designation",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Team
      {
        $lookup: {
          from: "teams",
          localField: "userDetails.teamId",
          foreignField: "_id",
          as: "userDetails.team",
          pipeline: [{ $project: { _id: 1, label: 1, value: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$userDetails.team",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Department
      {
        $lookup: {
          from: "departments",
          localField: "userDetails.department",
          foreignField: "_id",
          as: "userDetails.department",
          pipeline: [{ $project: { _id: 1, label: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$userDetails.department",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Primary Skills
      {
        $lookup: {
          from: "skills",
          localField: "userDetails.primarySkills",
          foreignField: "_id",
          as: "userDetails.primarySkills",
          pipeline: [{ $project: { _id: 1, label: 1, value: 1 } }],
        },
      },

      // Secondary Skills
      {
        $lookup: {
          from: "skills",
          localField: "userDetails.secondarySkills",
          foreignField: "_id",
          as: "userDetails.secondarySkills",
          pipeline: [{ $project: { _id: 1, label: 1, value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "leavebalances",
          localField: "_id",
          foreignField: "employeeId",
          as: "leaveDetail",
          pipeline: [{ $project: { _id: 1, leave: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$leaveDetail",
          preserveNullAndEmptyArrays: true,
        },
      },


      // Final projection
      {
        $project: {
          password: 0,
          __v: 0,
          "userDetails._id": 0,
          "userDetails.__v": 0,
        },
      },
    ]);

    if (!userWithDetails || userWithDetails.length === 0) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    return apiResponse(
      res,
      StatusCodes.OK,
      "User fetched successfully",
      userWithDetails[0]
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const stepNumber = parseInt(req.body.step);
    const userId = req.body.userId;

    if (!userId) {
      return handleError(res, { message: "userId is required in params" });
    }

    if (![1, 2, 3, 4].includes(stepNumber)) {
      return handleError(res, { message: "Invalid step" });
    }

    const userDetailsUpdate: any = {};

    // Step 1: Update basic user info
    if (stepNumber === 1) {
      const {
        firstName,
        lastName,
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
        role,
        gender,
        dateOfBirth,
      } = req.body;
      let roledata = await Role.findById({ _id: req.body.role }).select('role')
      let parsePermententAddress: any;
      if (typeof permenentAddress === "string") {
        parsePermententAddress = JSON.parse(permenentAddress);
      } else {
        parsePermententAddress = permenentAddress;
      }
      let parseCurrentAddress: any;
      if (typeof currentAddress === "string") {
        parseCurrentAddress = JSON.parse(currentAddress);
      } else {
        parseCurrentAddress = currentAddress;
      }
      let updateUserData: any = {
        firstName,
        lastName,
        role,
      };

      if (req.file) {
        const file = req.file as Express.Multer.File;
        const uploadResult = await Cloudinary.uploadToCloudinary(
          file,
          "employee_management"
        );
        updateUserData.image = uploadResult.secure_url;
      }
      {
        updateUserData.image = req.body.image;
      }

      await User.findByIdAndUpdate(
        userId,
        { $set: updateUserData },
        { new: true }
      );

      Object.assign(userDetailsUpdate, {
        phoneNumber,
        personalNumber,
        currentAddress: parseCurrentAddress,
        permenentAddress: parsePermententAddress,
        gender,
        dateOfBirth,
      });
    }

    // Step 2: Update professional info
    if (stepNumber === 2) {
      const {
        managerId,
        designationId,
        teamId,
        secondarySkills,
        primarySkills,
        department,
      } = req.body;

      let parsePrimarySkills: any;
      let parseSecondarySkills: any;

      if (typeof primarySkills === "string") {
        parsePrimarySkills = JSON.parse(primarySkills);
      } else {
        parsePrimarySkills = primarySkills;
      }
      if (typeof secondarySkills === "string") {
        parseSecondarySkills = JSON.parse(secondarySkills);
      } else {
        parseSecondarySkills = secondarySkills;
      }
      Object.assign(userDetailsUpdate, {
        managerId,
        designationId,
        teamId,
        secondarySkills: parsePrimarySkills,
        primarySkills: parseSecondarySkills,
        department,
      });
    }

    // Step 3: Update legal & experience info
    if (stepNumber === 3) {
      const {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
        currentSalary,
      } = req.body;

      Object.assign(userDetailsUpdate, {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
        currentSalary,
      });

      const user = await User.findById(userId);
     

      if (!user) {
        return handleError(res, {
          message: "User not found for leave balance",
        });
      }

      const joinMonth = moment(joiningDate).month(); // 0 = Jan, 11 = Dec
      const remainingMonths = 12 - joinMonth;
      const monthlyLeave = 1;
      const totalLeave = remainingMonths * monthlyLeave;

      // Avoid duplicate LeaveBalance creation if already exists
      const existingLeave = await LeaveBalance.findOne({
        employeeId: user._id,
      });
      if (!existingLeave) {
        await LeaveBalance.create({
          leave: totalLeave,
          employeeId: user._id,
        });
      }
    }

    // Step 4: Update bank details
    if (stepNumber === 4) {
      const { bankDetails } = req.body;
      let parseBankDetails: any = {};
      if (typeof bankDetails === "string") {
        parseBankDetails = JSON.parse(bankDetails);
      } else {
        parseBankDetails = bankDetails;
      }
      Object.assign(userDetailsUpdate, {
        bankDetails: parseBankDetails,
      });
    }

    // Apply update if any details collected
    if (Object.keys(userDetailsUpdate).length > 0) {
      await UserDetails.findOneAndUpdate(
        { userId },
        { $set: userDetailsUpdate },
        { new: true }
      );
    }

    return apiResponse(
      res,
      StatusCodes.OK,
      `Step ${stepNumber} update successful`,
      {
        userId,
      }
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllRole = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ role: { $ne: "ADMIN" } });

    if (roles.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.ROLE_FOUND, []);
    }
    apiResponse(res, StatusCodes.OK, messages.ROLE_FOUND, { roles: roles });
  } catch (error) {
    handleError(res, error);
  }
};





export const userList = async (req: Request, res: Response) => {
  try {
    const { search, role, pagination } = req.query;

    const query: any = { isDeleted: false, isActive: true };
    const isPaginationEnabled = pagination !== "false";

    let filterRoleId: Types.ObjectId | null = null;
    if (role && Types.ObjectId.isValid(role as string)) {
      filterRoleId = new Types.ObjectId(role as string);
    }

    const basePipeline: any[] = [
      {
        $addFields: {
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
        },
      },
      { $match: query },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "userRole",
        },
      },
      {
        $unwind: {
          path: "$userRole",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          ...(filterRoleId && { role: filterRoleId }),
          "userRole.role": { $ne: "ADMIN" },
        },
      },
      {
        $lookup: {
          from: "leavebalances",
          let: { empId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$employeeId", "$$empId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                leave: 1,
                paid: {
                  $sum: {
                    $map: {
                      input: "$leaveHistory",
                      as: "item",
                      in: "$$item.paidLeaveUsed",
                    },
                  },
                },
                unpaid: {
                  $sum: {
                    $map: {
                      input: "$leaveHistory",
                      as: "item",
                      in: "$$item.unpaidLeaveUsed",
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                totalLeaveUsed: { $add: ["$paid", "$unpaid"] },
              },
            },
            {
              $project: {
                leave: 1,
                totalLeaveUsed: 1,
              },
            },
          ],
          as: "leaveDetail",
        },
      },
      {
        $unwind: {
          path: "$leaveDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Add search filter
    if (search) {
      basePipeline.push({
        $match: {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // If pagination is disabled and no role is passed, fetch only project managers
    if (!isPaginationEnabled && !filterRoleId) {
      basePipeline.push({
        $match: {
          "userRole.role": "PROJECT_MANAGER",
        },
      });
    }

    // Clone for count query
    const countPipeline = JSON.parse(JSON.stringify(basePipeline));
    countPipeline.push({ $count: "total" });

    const countResult = await User.aggregate(countPipeline);
    const totalUser = countResult[0]?.total || 0;

    const dataPipeline = [...basePipeline];

    if (isPaginationEnabled) {
      const paginationData = paginationObject(req.query);
      dataPipeline.push({ $sort: paginationData.sort || { createdAt: -1 } });
      dataPipeline.push({ $skip: paginationData.skip || 0 });
      dataPipeline.push({ $limit: paginationData.resultPerPage || 10 });
    } else {
      dataPipeline.push({ $sort: { createdAt: -1 } });
    }

    dataPipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        fullName: 1,
        email: 1,
        isDeleted: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        role: "$userRole.role",
        totalLeave: "$leaveDetail.leave",
        usedLeave: "$leaveDetail.totalLeaveUsed",
      },
    });

    const user = await User.aggregate(dataPipeline);

    const totalPages = isPaginationEnabled
      ? Math.ceil(
          totalUser / (paginationObject(req.query).resultPerPage || 10)
        )
      : 1;

    return apiResponse(res, StatusCodes.OK, messages.USER_LIST, {
      user,
      totalCount: totalUser,
      totalPages,
    });
  } catch (error) {
    console.error("Aggregation Error:", error);
    handleError(res, error);
  }
};



export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const parseResult = resetPasswordLink.parse(req.body)
    const { email } = parseResult;

    const user: any = await User.findOne({ email: email });
    if (!user) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.USER_NOT_FOUND)
    }

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      })
      token.save()
    }
    const link = `${process.env.BASE_URL}?userId=${user._id}&token=${token.token}`;
    // Create HTML message with a button
    const htmlMessage = `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your password. Click the button below to reset it:</p>
    <a href="${link}" style="
      display: inline-block;
      padding: 12px 20px;
      margin: 20px 0;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    ">Reset Password</a>
 
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <p>Thanks,<br />Team Technithunder</p>
  </div>
`;
    await sendEmail({ email: user.email, subject: "Password reset", message: htmlMessage });
    apiResponse(res, StatusCodes.OK, messages.PASSWORD_RESET_LINK, { link: link })
  } catch (error) {
    handleError(res, error)
  }

}

export const resetPasswordForUser = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    const parseResult = resetPassword.parse(req.body);

    const { newPassword, confirmPassword } = parseResult;

    if (newPassword !== confirmPassword) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.PASSWORD_NOT_MATCHED)
    }


    const user: any = await User.findById(userId);
    if (!user) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.USER_NOT_FOUND)
    }

    const storedToken = await Token.findOne({
      userId: user?._id,
      token,
    })

    if (!storedToken) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.EXPIRED_TOKEN_OR_LINK)
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword

    await User.findByIdAndUpdate(userId, { new: true, password: hashedPassword });

    await storedToken?.deleteOne()
    apiResponse(res, StatusCodes.OK, messages.PASSWORD_RESET_SUCCESSFULLY)
  } catch (error) {
    handleError(res, error)
  }
}

export const userDelete = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id

    await Leave.findOneAndUpdate({ employeeId: userId }, { isDeleted: true })
    await LeaveBalance.findOneAndUpdate({ employeeId: userId }, { isDeleted: true })
    await UserDetails.findOneAndUpdate({ userId: userId }, { isDeleted: true })
    await User.findOneAndUpdate({ _id: userId }, { isDeleted: true })
    apiResponse(res, StatusCodes.OK, messages.USER_DELETED, true);
  } catch (error) {
    console.error("Aggregation Error:", error);
    handleError(res, error);
  }
}