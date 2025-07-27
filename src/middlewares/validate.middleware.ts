import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "../models/role.model";
import { User } from "../models/user.model";
declare global {
  namespace Express {
    interface Request {
      user?: { role?: string;[key: string]: any };
    }
  }
}

export const authorization = async (
  req: any,
  res: Response,
  next: NextFunction
) => {

  const userId = req.userInfo.id;
  const roleDoc: any = await User.findOne({ _id: userId }).populate('role');
  const userRole = roleDoc?.role.role;
  if (userRole === "HR" || userRole === "ADMIN") {
    next();
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "You are not authorized to access this resource.",
    });
  }
};


export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not authorized to access this resource.",
      });
    }
    next();
  };
};