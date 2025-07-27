import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addSkill,
  deleteSkillById,
  getAllSkill,
  getSkillById,
  updateSkillById,
} from "../controllers/skill.controller";

const skillRouter = express.Router();

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
 *  /api/add-skill:
 *    post:
 *      tags:
 *        - Skill Controller
 *      security:
 *       - bearerAuth: []
 *      summary : Add a Skill
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
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

skillRouter.post("/add-skill", authMiddleware, authorization, addSkill);

/**
 *  @openapi
 *  /api/skills:
 *    get:
 *      summary: Get all Skills with optional pagination and search
 *      tags:
 *        - Skill Controller
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
 *          description: Number of skills per page
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
 *            example: javascript
 *          description: Search term to filter skills by name
 *      responses:
 *        '200':
 *          description: Skills fetched successfully
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
 *          description: Not found
 */

skillRouter.get("/skills", authMiddleware, authorization, getAllSkill);

/**
 *  @openapi
 *  /api/skill/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Skill Controller
 *      summary : Get a Skill by ID
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
 *        '404' :
 *          description : Not found
 */
skillRouter.get("/skill/:id", authMiddleware, authorization, getSkillById);

/**
 *  @openapi
 *  /api/update-skill/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Skill Controller
 *      summary : Update a Skill by ID
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
skillRouter.patch(
  "/update-skill/:id",
  authMiddleware,
  authorization,
  updateSkillById
);

/**
 *  @openapi
 *  /api/delete-skill/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Skill Controller
 *      summary : Delete a Skill by ID
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
skillRouter.delete(
  "/delete-skill/:id",
  authMiddleware,
  authorization,
  deleteSkillById
);
export default skillRouter;
