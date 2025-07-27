import { Request, Response } from "express";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { Department } from "../models/department.model";
import { createDepartmentSchema, updateDepartmentSchema } from "../utils/zod";
import { paginationObject } from "../utils/pagination";

export const addDepartment = async (req: Request, res: Response) => {
  try {
    const parseData = createDepartmentSchema.parse(req.body);
    const label = parseData.label;

    const existingDepartment = await Department.findOne({ label });

    if (existingDepartment) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.DEPARTMENT_EXIST
      );
    }

    const department = await Department.create({ label });

    if (Department) {
      apiResponse(res, StatusCodes.CREATED, messages.DEPARTMENT_CREATED, {
        label,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};



export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const { search, pagination } = req.query as {
      search?: string;
      pagination?: string; 
    };

    const query: any = {};
    if (search) {
      query.$or = [{ label: { $regex: search, $options: "i" } }];
    }

    const totalCount = await Department.countDocuments(query);

    let departments;
    let totalPages = 1;

    if (pagination === "false") {
     
      departments = await Department.find(query).sort({ createdAt: -1 });
    } else {

      const paginationConfig: any = paginationObject(req.query);
      departments = await Department.find(query)
        .sort(paginationConfig.sort)
        .skip(paginationConfig.skip)
        .limit(paginationConfig.resultPerPage);

    
      totalPages = Math.ceil(totalCount / paginationConfig.resultPerPage);
    }

    if (departments.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_FOUND, []);
    }

    return apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_FOUND, {
      departments,
      totalCount,
      totalPages,
    });
  } catch (error) {
    handleError(res, error);
  }
};


export const getDepartment = async (req: Request, res: Response) => {
  try {
    const DepartmentId = req.params.id;

    const department = await Department.findById(DepartmentId);

    if (!Department) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.DEPARTMENT_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_FOUND, {
      Department: department,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateDepartmentById = async (req: Request, res: Response) => {
  try {
    const DepartmentId = req.params.id;

    const parseData = updateDepartmentSchema.parse(req.body);

    const existingDepartment = await Department.findById(DepartmentId);

    if (!existingDepartment) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.DEPARTMENT_EXIST);
    }
    const label = parseData.label;

    const updateDepartment = await Department.findByIdAndUpdate(
      DepartmentId,
      { label: label },
      { new: true }
    );
    if (!updateDepartment) {
      apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteDepartmentById = async (req: Request, res: Response) => {
  try {
    const DepartmentId = req.params.id;
    const existingDepartment = await Department.findById(DepartmentId);
    if (!existingDepartment) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.DEPARTMENT_NOT_FOUND);
    }
    await Department.findByIdAndDelete(DepartmentId);
    apiResponse(res, StatusCodes.OK, messages.DEPARTMENT_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
