import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";

import { addSalaryPdf, getSalaryById, getSalaryList } from "../controllers/salary.controller";

const salaryRoute = express.Router();

/**
 * @openapi
 * /api/salary-list:
 *   get:
 *     summary: Get list of employee salaries
 *     tags:
 *       - Salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by full name
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: January
 *         description: Filter by salary month (case-insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number (applies only when pagination is enabled)
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page (applies only when pagination is enabled)
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           example: createdAt
 *         description: Field to sort by (applies only when pagination is enabled)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc, ASC, DESC, 1, -1]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Salary list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Salary list fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           netSalary:
 *                             type: number
 *                           month:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           isDeleted:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           employee_full_name:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */


salaryRoute.get("/salary-list", authMiddleware, getSalaryList);



/**
 * @openapi
 * /api/salary/{id}:
 *   get:
 *     summary: Get salary details by salary ID
 *     tags:
 *       - Salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the salary record to fetch
 *     responses:
 *       200:
 *         description: Salary record found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Salary found successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     baseSalary:
 *                       type: number
 *                     netSalary:
 *                       type: number
 *                     leaveDeduction:
 *                       type: number
 *                     month:
 *                       type: string
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     employeeId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Salary record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

salaryRoute.get('/salary/:id',authMiddleware,getSalaryById);
/** 
* paths:
*   /salary-pdf:
*     post:
*       tags:
*         - Salary
*       summary: Generate Salary PDF
*       description: >
*         Generates a PDF report of employee salaries for a given month and/or year,
*         uploads it to Cloudinary, and returns the PDF URL.
*       operationId: generateSalaryPdf
*       security:
*         - bearerAuth: []
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 month:
*                   type: string
*                   example: "January"
*                   description: Month of the salary records (optional)
*                 year:
*                   type: string
*                   example: "2025"
*                   description: Year of the salary records (optional)
*               required: []
*       responses:
*         '201':
*           description: PDF generated and uploaded successfully
*           content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   status:
*                     type: string
*                     example: success
*                   message:
*                     type: string
*                     example: PDF file has been generated successfully
*                   data:
*                     type: object
*                     properties:
*                       pdfUrl:
*                         type: string
*                         example: https://res.cloudinary.com/demo/image/upload/v1234567890/emp/salary-report-January-2025.pdf
*         '400':
*           description: Bad request – missing month/year or no records
*           content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   status:
*                     type: string
*                     example: fail
*                   message:
*                     type: string
*                     example: Please provide at least month or a year
*         '500':
*           description: Internal Server Error
*           content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   status:
*                     type: string
*                     example: error
*                   message:
*                     type: string
*                     example: Internal Server Error
*/

salaryRoute.post('/salary-pdf',authMiddleware,authorization,addSalaryPdf)
export default salaryRoute;
