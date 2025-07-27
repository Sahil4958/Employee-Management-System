import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addDepartment,
  deleteDepartmentById,
  getAllDepartments,
  getDepartment,
  updateDepartmentById,
} from "../controllers/department.controller";

const departmentRouter = express.Router();

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
 *  /api/add-department:
 *    post:
 *      tags:
 *        - Department Controller
 *      security:
 *       - bearerAuth: []
 *      summary : Add department
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

departmentRouter.post(
  "/add-department",
  authMiddleware,
  authorization,
  addDepartment
);

/**
 *  @openapi
 *  /api/departments:
 *    get:
 *      summary: Get all Departments with optional pagination and search
 *      tags:
 *        - Department Controller
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *          description: Page number for pagination (used only if pagination is true)
 *        - in: query
 *          name: itemsPerPage
 *          schema:
 *            type: integer
 *            default: 10
 *          description: Number of departments per page (used only if pagination is true)
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
 *            example: IT Department
 *          description: Search term to filter departments by name
 *        - in: query
 *          name: pagination
 *          schema:
 *            type: string
 *            enum: [true, false]
 *            default: true
 *          description: Enable or disable pagination
 *      responses:
 *        '200':
 *          description: Departments fetched successfully
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
 *                    example: Department fetched successfully
 *                  data:
 *                    type: object
 *                    properties:
 *                      departments:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            label:
 *                              type: string
 *                              example: IT Department
 *                            value:
 *                              type: string
 *                              example: it_dept_01
 *                      totalCount:
 *                        type: integer
 *                        example: 42
 *        '404':
 *          description: No department found
 *        '401':
 *          description: Unauthorized – Bearer token missing or invalid
 */

departmentRouter.get(
  "/departments",
  authMiddleware,
  authorization,
  getAllDepartments
);

/**
 *  @openapi
 *  /api/department/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Department Controller
 *      summary : Get a department by ID
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
departmentRouter.get(
  "/department/:id",
  authMiddleware,
  authorization,
  getDepartment
);

/**
 *  @openapi
 *  /api/update-department/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Department Controller
 *      summary : Update a department by ID
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
departmentRouter.patch(
  "/update-department/:id",
  authMiddleware,
  authorization,
  updateDepartmentById
);

/**
 *  @openapi
 *  /api/delete-department/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Department Controller
 *      summary : Delete a department by ID
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
departmentRouter.delete(
  "/delete-department/:id",
  authMiddleware,
  authorization,
  deleteDepartmentById
);

export default departmentRouter;
