import { Request, Response, NextFunction } from "express";

export interface IRequest extends Request {
  user?: any; 
  session?: any;
  files?:any
  file?:any
}