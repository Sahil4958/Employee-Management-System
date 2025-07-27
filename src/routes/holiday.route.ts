import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addHoliday,
  deleteHolidayById,
  getAllHolidays,
  getHoliday,
  updateHolidayById,
} from "../controllers/holiday.controller";

const holidayRouter = express.Router();

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
 *  /api/add-holiday:
 *    post:
 *      tags:
 *        - Holiday Controller
 *      security:
 *        - bearerAuth: []
 *      summary: Add Holiday
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - label
 *                - date
 *              properties:
 *                label:
 *                  type: string
 *                  example: "Independence Day"
 *                date:
 *                  type: string
 *                  format: date
 *                  example: "2025-08-15"
 *      responses:
 *        '201':
 *          description: Created
 *        '400':
 *          description: Bad request
 *        '404':
 *          description: Not found
 */


// holidayRouter.post("/add-holiday", authMiddleware, authorization, addHoliday);
holidayRouter.post("/add-holiday", addHoliday);
/**
 *  @openapi
 *  /api/holidays:
 *    get:
 *      summary: Get all Holidays with optional pagination and search
 *      tags:
 *        - Holiday Controller
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
 *          description: Number of holidays per page
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
 *            example: diwali
 *          description: Search term to filter holidays by name
 *      responses:
 *        '200':
 *          description: Holiday fetched successfully
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
 *                    example: Holiday fetched successfully
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
 *                            value:
 *                              type: string
 *                      totalcount:
 *                        type: integer
 *                        example: 10
 *        '404':
 *          description: No Holiday found
 *        '401':
 *          description: Unauthorized – Bearer token missing or invalid
 */



holidayRouter.get("/holidays", authMiddleware, getAllHolidays);



/**
 *  @openapi
 *  /api/holiday/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Get a Holiday by ID
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
holidayRouter.get("/holiday/:id", authMiddleware, authorization, getHoliday);


/**
 *  @openapi
 *  /api/update-holiday/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Update a holiday by ID
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
holidayRouter.patch(
  "/update-holiday/:id",
  authMiddleware,
  authorization,
  updateHolidayById
);


/**
 *  @openapi
 *  /api/delete-holiday/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Delete a Holiday by ID
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
holidayRouter.delete(
  "/delete-holiday/:id",
  authMiddleware,
  authorization,
  deleteHolidayById
);

export default holidayRouter;
