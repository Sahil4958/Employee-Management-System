import express from "express";
import { addLeave, approveLeave, deleteLeave, getLeaveById, leaveList, updateLeave } from "../controllers/leave.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const leaveRouter = express.Router();

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
 * @openapi
 * /api/add-leave:
 *   post:
 *     summary: Create a new leave request
 *     tags: 
 *       - Leave Controller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type
 *               - startDate
 *               - endDate
 *               - status
 *               - comments
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECT]
 *               comments:
 *                 type: string
 *               start_leave_type:
 *                 type: string
 *                 enum: [FULL_DAY,FIRST_HALF, SECOND_HALF]
 *                 nullable: true
 *               end_leave_type:
 *                 type: string
 *                 enum: [FULL_DAY,FIRST_HALF, SECOND_HALF]
 *                 nullable: true
 *               totalDays:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Leave successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Leave added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     leave:
 *                       $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Leave already exists or bad request
 */

leaveRouter.post('/add-leave', authMiddleware, addLeave);

/**
 * @openapi
 * /api/leave/{id}:
 *   get:
 *     summary: Get leave details by ID
 *     tags:
 *       - Leave Controller
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave found
 *       400:
 *         description: Leave not found
 *       500:
 *         description: Internal server error
 */

leaveRouter.get('/leave/:id', getLeaveById)

/**
 * @openapi
 * /api/leave-list:
 *   get:
 *     summary: Get a paginated list of leave records
 *     tags:
 *       - Leave Controller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by leave status (e.g., PENDING, APPROVED, REJECTED)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter leave records starting on or after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter leave records ending on or before this date (inclusive)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [REQUESTED]
 *         description: Used by HR or PROJECT_MANAGER to filter requested leaves awaiting their approval
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave list fetched successfully
 *       500:
 *         description: Internal server error
 */

leaveRouter.get('/leave-list', authMiddleware, leaveList);
/**
 * @openapi
 * /api/update-leave/{id}:
 *   patch:
 *     summary: Update an existing leave (only employee can update their own)
 *     tags:
 *       - Leave Controller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-25"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-27"
 *               comments:
 *                 type: string
 *                 example: "Updated reason for leave"
 *               start_leave_type:
 *                 type: string
 *                 enum: [FULL_DAY, FIRST_HALF, SECOND_HALF]
 *                 example: "FULL_DAY"
 *               end_leave_type:
 *                 type: string
 *                 enum: [FULL_DAY, FIRST_HALF, SECOND_HALF]
 *                 example: "FULL_DAY"
 *               totalDays:
 *                 type: number
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Leave updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Leave updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     leave:
 *                       $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Invalid date input
 *       403:
 *         description: Unauthorized to update
 *       404:
 *         description: Leave not found
 *       500:
 *         description: Internal server error
 */
leaveRouter.patch('/update-leave/:id', authMiddleware, updateLeave);



/**
 * @openapi
 * /api/delete-leave/{id}:
 *   delete:
 *     summary: Soft delete a leave by ID
 *     tags:
 *       - Leave Controller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID to be soft deleted
 *     responses:
 *       200:
 *         description: Leave deleted successfully
 *       400:
 *         description: Leave not found
 *       500:
 *         description: Internal server error
 */


leaveRouter.delete('/delete-leave/:id', authMiddleware, deleteLeave);


/**
 * @openapi
 * /api/leave-approval/{id}:
 *   post:
 *     summary: Approve or reject a leave request
 *     tags:
 *       - Leave Controller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID to approve or reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 *       400:
 *         description: Leave not found or invalid data
 *       401:
 *         description: Unauthorized – Bearer token missing or invalid
 *       500:
 *         description: Internal server error
 */


leaveRouter.post('/leave-approval/:id', authMiddleware, approveLeave)

export default leaveRouter;