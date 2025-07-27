import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { apiResponse } from "../utils/apiResponses";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";

dotenv.config();

interface DecoededTokenInfo {
  username: string;
  role: string;
id: string
}
declare global {
  namespace Express {
    interface Request {
      userInfo?: DecoededTokenInfo;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    apiResponse(res, StatusCodes.BAD_REQUEST, messages.TOKENLESS_ERROR);
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRETKEY!
    ) as DecoededTokenInfo;
    req.userInfo = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Access denied, token verification failed. Please log in to continue.",
    });
  }
};
