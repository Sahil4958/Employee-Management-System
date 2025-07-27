import { Request, Response } from "express";
import { Team } from "../models/team.model";
import { teamZodSchema, updateTeamSchema } from "../utils/zod";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { paginationObject } from "../utils/pagination";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const parseData = teamZodSchema.parse(req.body);
    const { managerId } = parseData;
    if (!managerId) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.MANAGER_ID_NOT_FOUND);
    }

    const existingManager = await Team.findById(managerId);
    if (existingManager) {
      apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.EXISTING_MANAGER_WITH_TEAM
      );
    }
    const label = parseData.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const existingTeam = await Team.findOne({ label });

    if (existingTeam) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.EXISTING_TEAM);
    }

    const team = await Team.create({ managerId, label, value });

    if (team) {
      apiResponse(res, StatusCodes.CREATED, messages.TEAM_CREATED, {
        managerId: managerId,
        label: team.label,
        value: team.value,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllTeam = async (req: Request, res: Response) => {
  try {
    const { search, pagination } = req.query as { search?: string; pagination?: string };
    const isPaginationEnabled = pagination !== "false";
    const paginationData = paginationObject(req.query);

    const matchStage = search
      ? [
        {
          $match: {
            $or: [{ label: { $regex: search, $options: "i" } }],
          },
        },
      ]
      : [];

    const pipeline: any[] = [
      ...matchStage,
      {
        $lookup: {
          from: "users",
          localField: "managerId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          value: 1,
          label: 1,
          managerFirstName: "$userData.firstName",
          managerLastName: "$userData.lastName",
        },
      },
    ];

    // Only apply sort, skip, limit if pagination is enabled
    if (isPaginationEnabled) {
      pipeline.push({ $sort: paginationData.sort || { createdAt: -1 } });
      pipeline.push({ $skip: paginationData.skip || 0 });
      pipeline.push({ $limit: paginationData.resultPerPage || 10 });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // Still apply sort when no pagination
    }

    const team = await Team.aggregate(pipeline);

    const totalCount = await Team.countDocuments(
      search ? { label: { $regex: search, $options: "i" } } : {}
    );

    apiResponse(res, StatusCodes.OK, messages.TEAMS_FOUND, {
      team,
      totalCount,
      totalPages: isPaginationEnabled
        ? Math.ceil(totalCount / paginationData.resultPerPage || 10)
        : 1,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findById(teamId).populate(
      "managerId",
      "firstName lastName"
    );
    if (!team) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.TEAM_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.TEAM_FOUND, team);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;
    const parseData = updateTeamSchema.parse(req.body);

    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.TEAM_NOT_FOUND);
    }

    const label = parseData.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { label, value },
      { new: true }
    );
    if (!updatedTeam) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.TEAM_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.TEAM_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;

    const existingTeam = await Team.findById(teamId);

    if (!existingTeam) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.TEAM_NOT_FOUND);
    }

    await Team.findByIdAndDelete(teamId);
    apiResponse(res, StatusCodes.OK, messages.TEAM_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
