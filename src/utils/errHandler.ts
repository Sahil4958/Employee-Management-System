import { Response } from "express";
import { ZodError } from "zod";
import { apiResponse } from "./apiResponses";

export const handleError = async (
  res: Response,
  error: unknown
): Promise<void> => {
  if (error instanceof ZodError) {
    apiResponse(res, 400, "Validation Error", error.errors);
    return;
  }
  apiResponse(res, 500, (error as Error)?.message || "Something Went Wrong");
  return;
};
