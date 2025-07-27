import { Request, Response } from "express";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { Designation } from "../models/designation.model";
import { createDesignationSchema, updateDesignationSchema } from "../utils/zod";
import { paginationObject } from "../utils/pagination";


export const addDesignation = async (req: Request, res: Response) => {
  try {
    const parseData = createDesignationSchema.parse(req.body);
    const label = parseData.label;

    const existingdesignation = await Designation.findOne({ label });

    if (existingdesignation) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.DESIGNATION_EXIST
      );
    }

    const designation = await Designation.create({ label });

    if (designation) {
      apiResponse(res, StatusCodes.CREATED, messages.DESIGNATION_CREATED, {
        label,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAlldesignations = async (req: Request, res: Response) => {
  try {
    const { search, pagination } = req.query as {
      search?: string;
      pagination?: string;
    };

    const query: any = {};
    if (search) {
      query.$or = [{ label: { $regex: search, $options: "i" } }];
    }

    const totalCount = await Designation.countDocuments(query);

    let designation;
    let totalPages = 1;

    if (pagination === "false") {
      designation = await Designation.find(query).sort({ createdAt: -1 });
    } else {
      const paginationConfig: any = paginationObject(req.query);
      designation = await Designation.find(query)
        .sort(paginationConfig.sort)
        .skip(paginationConfig.skip)
        .limit(paginationConfig.resultPerPage);

      totalPages = Math.ceil(totalCount / paginationConfig.resultPerPage);
    }

    if (designation.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.DESIGNATION_FOUND, []);
    }

    return apiResponse(res, StatusCodes.OK, messages.DESIGNATION_FOUND, {
      designations: designation,
      totalCount,
      totalPages,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getdesignation = async (req: Request, res: Response) => {
  try {
    const designationId = req.params.id;

    const designation = await Designation.findById(designationId);

    if (!designation) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.DESIGNATION_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.DESIGNATION_FOUND, {
      designation: designation,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updatedesignationById = async (req: Request, res: Response) => {
  try {
    const designationId = req.params.id;

    const parseData = updateDesignationSchema.parse(req.body);

    const existingdesignation = await Designation.findById(designationId);

    if (!existingdesignation) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.DESIGNATION_EXIST);
    }
    const label = parseData.label;

    const updatedesignation = await Designation.findByIdAndUpdate(
      designationId,
      { label: label },
      { new: true }
    );
    if (!updatedesignation) {
      apiResponse(res, StatusCodes.OK, messages.DESIGNATION_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.DESIGNATION_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deletedesignationById = async (req: Request, res: Response) => {
  try {
    const designationId = req.params.id;
    const existingdesignation = await Designation.findById(designationId);
    if (!existingdesignation) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.DESIGNATION_NOT_FOUND);
    }
    await Designation.findByIdAndDelete(designationId);
    apiResponse(res, StatusCodes.OK, messages.DESIGNATION_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
