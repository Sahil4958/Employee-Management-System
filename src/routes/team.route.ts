import express from "express";
import {
  createTeam,
  deleteTeam,
  getAllTeam,
  getTeamById,
  updateTeam,
} from "../controllers/team.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";

const teamRouter = express.Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 *  @openapi
 *  /api/create-team:
 *    post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Create a Team
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - label
 *                - managerId
 *              properties :
 *                label :
 *                  type : string
 *                managerId :
 *                  type : string
 *                  description: ID of the team manager
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

teamRouter.post("/create-team", authMiddleware, authorization, createTeam);

/**
 *  @openapi
 *  /api/teams:
 *    get:
 *      summary: Get all Teams with optional pagination, sorting, and search
 *      tags:
 *        - Team Controller
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *          description: Page number for pagination
 *        - in: query
 *          name: itemsPerPage
 *          schema:
 *            type: integer
 *            default: 10
 *        - in: query
 *          name: pagination
 *          schema:
 *            type: boolean
 *            default: true
 *          description: Number of results per page
 *        - in: query
 *          name: sortBy
 *          schema:
 *            type: string
 *            default: createdAt
 *          description: Field to sort by
 *        - in: query
 *          name: sortOrder
 *          schema:
 *            type: string
 *            enum: [asc, desc]
 *            default: desc
 *          description: Sort direction
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: Search teams by label or value
 *      responses:
 *        '200':
 *          description: Successfully fetched teams
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                  message:
 *                    type: string
 *                    example: Teams fetched successfully
 *                  data:
 *                    type: object
 *                    properties:
 *                      team:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            value:
 *                              type: string
 *                            label:
 *                              type: string
 *                            managerFirstName:
 *                              type: string
 *                              nullable: true
 *                            managerLastName:
 *                              type: string
 *                              nullable: true
 *                      totalCount:
 *                        type: integer
 *                        example: 5
 *        '404':
 *          description: No teams found
 *        '401':
 *          description: Unauthorized – Bearer token missing or invalid
 */

teamRouter.get("/teams", authMiddleware, authorization, getAllTeam);

/**
 *  @openapi
 *  /api/team/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Get a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses :
 *        '200':
 *          description : OK
 *
 *
 *        '404' :
 *          description : Not found
 */

teamRouter.get("/team/:id", authMiddleware, authorization, getTeamById);

/**
 *  @openapi
 *  /api/update-team/{id}:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Update a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - label
 *              properties :
 *                label :
 *                  type : string
 *
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */

teamRouter.patch("/update-team/:id", authMiddleware, authorization, updateTeam);

/**
 *  @openapi
 *  /api/delete-team/{id}:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Delete a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */
teamRouter.delete(
  "/delete-team/:id",
  authMiddleware,
  authorization,
  deleteTeam
);

export default teamRouter;
