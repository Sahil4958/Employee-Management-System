import { Request, Response } from "express";
import { Manager } from "../models/manager.model";
import { updateManagerSchema, managerZodSchema } from "../utils/zod";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { User } from "../models/user.model";

export const createManager = async (req: Request, res: Response) => {
  try {
    const parsedData = managerZodSchema.parse(req.body);
    const label = parsedData.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const existingManager = await Manager.findOne({ label });
    if (existingManager) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.EXISTING_MANAGER);
    }

    const manager = await Manager.create({ label, value });
    if (manager) {
      apiResponse(res, StatusCodes.CREATED, messages.MANAGER_CREATED, {
        label: manager.label,
        value: manager.value,
      });

    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllManagers = async (req: Request, res: Response) => {
  try {
    const managers = await User.aggregate([
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "roles",              
          localField: "role",          
          foreignField: "_id",         
          as: "roleData"
        }
      },
      {
        $unwind: "$roleData"
      },
      {
        $match: {
          "roleData.role": "PROJECT_MANAGER",
          "roleData.isDeleted": false
        }
      },
      {
        $project: {
          password: 0,
          roleData: 0, 
        }
      }
    ]);

    if (managers.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.MANAGER_NOT_FOUND, []);
    }

    return apiResponse(res, StatusCodes.OK, messages.MANAGER_FOUND, managers);
  } catch (error) {
    return handleError(res, error);
  }
};


export const getManagerById = async (req: Request, res: Response) => {
  try {
    const managerId = req.params.id;
    const manager = await Manager.findById(managerId);
    if (!manager) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.MANAGER_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.MANAGER_FOUND, manager);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateManager = async (req: Request, res: Response) => {
  try {
    const managerId = req.params.id;
    const parseData = updateManagerSchema.parse(req.body);

    const existingManager = await Manager.findById(managerId);
    if (!existingManager) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.MANAGER_NOT_FOUND);
    }
    const label = parseData.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const updateManager = await Manager.findByIdAndUpdate(
      managerId,
      { label, value },
      { new: true }
    );

    if (!updateManager) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.MANAGER_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.MANAGER_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManager = async (req: Request, res: Response) => {
  try {
    const managerId = req.params.id;
    const existingManager = await Manager.findById(managerId);

    if (!existingManager) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.MANAGER_NOT_FOUND);
    }

    await Manager.findByIdAndDelete(managerId);

    apiResponse(res, StatusCodes.OK, messages.MANAGER_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
