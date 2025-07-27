import moment from "moment";
import { Request, Response } from "express";
import { Leave } from "../models/leave.model";

import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { messages } from "../utils/messages";
import { leaveSchema } from "../utils/zod";
import { User } from "../models/user.model";
import { StatusCodes } from "http-status-codes";
import { UserDetails } from "../models/userDetails.model";
import { Role } from "../models/role.model";
import { paginationObject } from "../utils/pagination";
import { LeaveBalance } from "../models/leaveBalance.models";
import mongoose from "mongoose";

export const addLeave = async (req: any, res: Response) => {
  try {
    const parseData = leaveSchema.parse(req.body);

    const userId = req.userInfo?.id;
    const {
      startDate,
      endDate,
      // start_leave_half_type,
      start_leave_type,
      // end_leave_half_type,
      end_leave_type,
      totalDays,
    } = parseData;

    let existingUser: any;

    if (req.userInfo?.role?.role === "EMPLOYEE") {
      existingUser = await UserDetails.findOne({ userId: userId });
    } else if (
      req.userInfo?.role.role === "PROJECT_MANAGER" ||
      req.userInfo?.role.role === "HR"
    ) {
      const roles = await Role.findOne({ role: "ADMIN" });

      existingUser = await User.findOne({ role: roles?._id });
    }

    if (!existingUser) {
      const roles = await Role.findOne({ role: "ADMIN" });

      existingUser = await User.findOne({ role: roles?._id });
    }

    const existingLeave = await Leave.findOne({
      employeeId: userId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      approveId: existingUser.managerId,
      isDeleted: false,
    });
    if (existingLeave) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_EXIST);
    }

    const leave = await Leave.create({
      employeeId: userId,
      startDate: startDate,
      endDate: endDate,
      comments: parseData.comments,
      status: "PENDING",
      approveId: existingUser?.managerId || existingUser?._id,
      // start_leave_half_type,
      start_leave_type,
      // end_leave_half_type,
      end_leave_type,
      totalDays,
    });

    if (leave) {
      apiResponse(res, StatusCodes.CREATED, messages.LEAVE_ADDED, {
        leave: leave,
      });
    }
    apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_ADDED);
  } catch (error) {
    handleError(res, error);
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findById(leaveId)
      .populate({
        path: "approveId",
        select: "firstName lastName -_id",
      })
      .populate({
        path: "approveById",
        select: "firstName lastName -_id",
      })
      .populate({
        path: "employeeID",
        select: "firstName lastName -_id",
      })
      .lean();

    if (!leave) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.LEAVE_FOUND, leave);
  } catch (error) {
    handleError(res, error);
  }
};

export const leaveList = async (req: any, res: Response) => {
  try {
    const pagination = paginationObject(req.query);

    const { skip, resultPerPage, sort } = pagination;

    const { status, startDate, endDate, filter } = req.query;

    const match: any = { isDeleted: false };
    if (req.userInfo?.role?.role === "EMPLOYEE") {
      match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
    }
    if (req.userInfo?.role?.role === "PROJECT_MANAGER") {
      if (filter === "REQUESTED") {
        match.approveId = new mongoose.Types.ObjectId(req.userInfo?.id);
      } else {
        match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
      }
    }
    if (req.userInfo?.role?.role === "HR") {
      if (filter === "REQUESTED") {
        match.approveId = new mongoose.Types.ObjectId(req.userInfo?.id);
      } else {
        match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
      }
    }

    if (status) match.status = status;
    if (startDate) match.startDate = { $gte: new Date(startDate as string) };
    if (endDate) {
      match.endDate = match.endDate || {};
      match.endDate.$lte = new Date(endDate as string);
    }

    const { search } = req.query;

    const pipeline: any = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approveId",
          foreignField: "_id",
          as: "approveId",
        },
      },
      {
        $unwind: { path: "$employeeId", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$approveId", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          employeefullName: {
            $concat: ["$employeeId.firstName", " ", "$employeeId.lastName"],
          },
          approverfullName: {
            $concat: ["$approveId.firstName", " ", "$approveId.lastName"],
          },
        },
      },
    ];

    // Add search filter on computed full names
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { employeefullName: { $regex: search, $options: "i" } },
            { approverfullName: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          startDate: 1,
          endDate: 1,
          status: 1,
          comments: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          start_leave_half_type: 1,
          start_leave_type: 1,
          end_leave_half_type: 1,
          end_leave_type: 1,
          totalDays: 1,
          approverfullName: 1,
          employeefullName: 1,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: resultPerPage }
    );

    const [leaves, totalLeaves] = await Promise.all([
      Leave.aggregate(pipeline),
      Leave.countDocuments(match),
    ]);

    return apiResponse(res, StatusCodes.OK, "Leave list fetched successfully", {
      data: leaves,
      pagination: {
        totalCount: totalLeaves,
        totalPages: pagination.page,
        itemsPerPage: resultPerPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateLeave = async (req: any, res: Response) => {
  try {
    const leaveId = req.params.id;
    const userId = req.userInfo?.id;
    const userRole = req.userInfo?.role?.role;

    const leave = await Leave.findById(leaveId);
    if (!leave || leave.isDeleted) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.LEAVE_NOT_FOUND);
    }

    const {
      startDate,
      endDate,
      comments,

      start_leave_type,

      end_leave_type,
      totalDays,
    } = req.body;
    if (startDate && moment(startDate).isBefore(moment(), "day")) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Start date cannot be in the past"
      );
    }

    if (
      endDate &&
      moment(endDate).isBefore(moment(startDate || leave.startDate), "day")
    ) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "End date cannot be before start date"
      );
    }
    if (startDate && !isNaN(Date.parse(startDate))) {
      leave.startDate = new Date(startDate);
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      leave.endDate = new Date(endDate);
    }
    if (comments !== undefined) {
      leave.comments = comments;
    }
    if (startDate) leave.startDate = startDate;
    if (endDate) leave.endDate = endDate;
    if (comments !== undefined) leave.comments = comments;
    if (start_leave_type) leave.start_leave_type = start_leave_type;
    // if (start_leave_half_type) leave.start_leave_half_type = start_leave_half_type;
    if (end_leave_type) leave.end_leave_type = end_leave_type;
    // if (end_leave_half_type) leave.end_leave_half_type = end_leave_half_type;

    leave.totalDays = totalDays;
    await leave.save();

    return apiResponse(res, StatusCodes.OK, messages.LEAVE_UPDATED, { leave });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const leaveId = req.params.id;
    const existingLeave = await Leave.findOneAndUpdate(
      { _id: leaveId },
      { isDeleted: true },
      { new: true }
    );
    if (existingLeave) {
      return apiResponse(res, StatusCodes.OK, messages.LEAVE_DELETED);
    } else {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_FOUND);
    }
  } catch (error) {
    handleError(res, error);
  }
};


export const approveLeave = async (req: any, res: Response) => {
  try {
    const leaveId = req.params.id;
    const userId = req.userInfo?.id;
    const { status } = req.body;

    if (!["APPROVED", "REJECT"].includes(status)) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Invalid status value");
    }

    const existingLeave = await Leave.findById(leaveId);
    if (!existingLeave || existingLeave.isDeleted) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.LEAVE_NOT_FOUND);
    }

    if (existingLeave.status !== "PENDING") {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Leave already processed"
      );
    }

    const leaveBalance = await LeaveBalance.findOne({
      employeeId: existingLeave.employeeId,
      isDeleted: false,
    });

    if (status === "APPROVED") {
      if (!leaveBalance) {
        return apiResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Leave balance not found"
        );
      }

      const leaveDays = Number(existingLeave.totalDays);
      if (isNaN(leaveDays) || leaveDays <= 0) {
        return apiResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Invalid totalDays in leave"
        );
      }

      const availableLeave = Number(leaveBalance.leave ?? 0);
      const deductedLeave = Math.min(availableLeave, leaveDays);
      const unpaidLeaves = Math.max(leaveDays - deductedLeave, 0);

      // Update paid leave balance
      leaveBalance.leave = availableLeave - deductedLeave;
      leaveBalance.usedLeave = (leaveBalance.usedLeave ?? 0) + deductedLeave;

      // Update leaveHistory for current month
      const currentMonth = moment(existingLeave.startDate).format("MMMM");
      const currentYear = moment(existingLeave.startDate).year();

      await LeaveBalance.updateOne(
        { employeeId: existingLeave.employeeId, isDeleted: false },
        {
          $inc: {
            leave: -deductedLeave,
            usedLeave: deductedLeave,
          },
        }
      );

      // 2. Try updating existing month entry in leaveHistory
      const updateResult = await LeaveBalance.updateOne(
        {
          employeeId: existingLeave.employeeId,
          isDeleted: false,
          "leaveHistory.month": currentMonth,
          "leaveHistory.year": currentYear,
        },
        {
          $inc: {
            "leaveHistory.$.paidLeaveUsed": deductedLeave,
            "leaveHistory.$.unpaidLeaveUsed": unpaidLeaves,
          },
        }
      );

      // 3. If no matching month entry, push new one
      if (updateResult.matchedCount === 0) {
        await LeaveBalance.updateOne(
          { employeeId: existingLeave.employeeId, isDeleted: false },
          {
            $push: {
              leaveHistory: {
                month: currentMonth,
                year: currentYear,
                paidLeaveUsed: deductedLeave,
                unpaidLeaveUsed: unpaidLeaves,
              },
            },
          }
        );
      }
    }

    // Update leave status and approveById
    const approvedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, approveById: userId },
      { new: true }
    );

    return apiResponse(res, StatusCodes.OK, "Leave status updated", {
      leave: approvedLeave
    });
  } catch (error) {
    handleError(res, error);
  }
};
