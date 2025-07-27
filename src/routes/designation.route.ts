import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addDesignation,
  deletedesignationById,
  getAlldesignations,
  getdesignation,
  updatedesignationById,
} from "../controllers/designation.controller";

const designationRouter = express.Router();

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
 *  /api/add-designation:
 *    post:
 *      tags:
 *        - Designation Controller
 *      security:
 *       - bearerAuth: []
 *      summary : Add designation
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

designationRouter.post(
  "/add-designation",
  authMiddleware,
  authorization,
  addDesignation
);

/**
 *  @openapi
 *  /api/designations:
 *    get:
 *      summary: Get all Designations with optional pagination and search
 *      tags:
 *        - Designation Controller
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            default: 1
 *          description: Page number for pagination (used only if pagination=true)
 *        - in: query
 *          name: itemsPerPage
 *          schema:
 *            type: integer
 *            default: 10
 *          description: Number of designations per page (used only if pagination=true)
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
 *            example: manager
 *          description: Search term to filter designations by label
 *        - in: query
 *          name: pagination
 *          schema:
 *            type: string
 *            enum: [true, false]
 *            default: true
 *          description: Set to "false" to disable pagination and fetch all results
 *      responses:
 *        '200':
 *          description: Designations fetched successfully
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
 *                    example: Designations fetched successfully
 *                  data:
 *                    type: object
 *                    properties:
 *                      designations:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            label:
 *                              type: string
 *                              example: Manager
 *                            value:
 *                              type: string
 *                              example: manager
 *                      totalCount:
 *                        type: integer
 *                        example: 15
 *                      totalPages:
 *                        type: integer
 *                        example: 2
 *        '404':
 *          description: No designations found
 *        '401':
 *          description: Unauthorized – Bearer token missing or invalid
 */

designationRouter.get(
  "/designations",
  authMiddleware,
  authorization,
  getAlldesignations
);

/**
 *  @openapi
 *  /api/designation/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Get a designation by ID
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
designationRouter.get(
  "/designation/:id",
  authMiddleware,
  authorization,
  getdesignation
);

/**
 *  @openapi
 *  /api/update-designation/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Update a designation by ID
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
designationRouter.patch(
  "/update-designation/:id",
  authMiddleware,
  authorization,
  updatedesignationById
);

/**
 *  @openapi
 *  /api/delete-designation/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Delete a designation by ID
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
designationRouter.delete(
  "/delete-designation/:id",
  authMiddleware,
  authorization,
  deletedesignationById
);

export default designationRouter;
