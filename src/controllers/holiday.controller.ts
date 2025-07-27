import { Request, Response } from "express";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { Holiday } from "../models/holidayList.model";
import { createHolidaySchema, updateHolidaySchema } from "../utils/zod";
import { paginationObject } from "../utils/pagination";
import { date } from "zod";

export const addHoliday = async (req: Request, res: Response) => {
  try {
    const parseData = createHolidaySchema.parse(req.body);
    const { label, date } = parseData;


    const existingHoliday = await Holiday.findOne({ label });

    if (existingHoliday) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_EXIST);
    }

    const holiday = await Holiday.create({ label, date });

    if (holiday) {
      apiResponse(res, StatusCodes.CREATED, messages.HOLIDAY_CREATED, {
        label,
        date
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllHolidays = async (req: Request, res: Response) => {
  try {
    const pagination: any = paginationObject(req.query);
    const { search } = req.query as {
      search?: string;
    };

    const query: any = {};
    if (search) {
      query.$or = [{ label: { $regex: search, $options: "i" } }];
    }

    const holiday = await Holiday.find(query)
      .sort(pagination.sort)
      .skip(pagination.skip)
      .limit(pagination.resultPerPage);

    if (holiday.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.HOLIDAY_FOUND);
    }

    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_FOUND, {
      holidays: holiday,
      totalcount: holiday.length,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getHoliday = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;

    const holiday = await Holiday.findById(holidayId);

    if (!holiday) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.HOLIDAY_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_FOUND, {
      holiday: holiday,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateHolidayById = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;

    const parseData = updateHolidaySchema.parse(req.body);

    const existingHoliday = await Holiday.findById(holidayId);

    if (!existingHoliday) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_EXIST);
    }
    const { label, date } = parseData;

    const updateHoliday = await Holiday.findByIdAndUpdate(
      holidayId,
      { label, date },
      { new: true }
    );
    if (!updateHoliday) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteHolidayById = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;
    const existingHoliday = await Holiday.findById(holidayId);
    if (!existingHoliday) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_NOT_FOUND);
    }
    await Holiday.findByIdAndDelete(holidayId);
    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
