import express from "express";
import {
  createUser,
  getUserId,
  loginUser,
  userCreate,
  getAllRole,
  userList,
  updateUser,
  forgotPassword,
  resetPasswordForUser,
  userDelete,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload";

const userRouter = express.Router();

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
 *  /api/register:
 *    post:
 *      tags:
 *        - User Controller
 *      summary : Create an User
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - email
 *                - firstName
 *                - lastName
 *                - password
 *                - role
 *              properties :
 *                email :
 *                  type : string
 *                firstName :
 *                  type : string
 *                lastName :
 *                  type: string
 *                password :
 *                  type : string
 *                role :
 *                  type : string
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

userRouter.post("/register", createUser);

/**
 *  @openapi
 *
 *  /api/login:
 *    post:
 *      tags:
 *        - User Controller
 *      summary : Login an User
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - email
 *                - password
 *
 *              properties :
 *                email :
 *                  type : string
 *                password :
 *                  type : string
 *
 *      responses :
 *        '200':
 *          description : OK
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

userRouter.post("/login", loginUser);

/**
 * @openapi
 * /api/add-user:
 *   post:
 *     summary: Create or update user in step-wise manner
 *     tags:
 *       - User Controller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - step
 *             properties:
 *               step:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: Step number (1–4)
 *               userId:
 *                 type: string
 *                 description: Required for steps 2–4
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Role ObjectId
 *               email:
 *                 type: string
 *               personalEmail:
 *                 type : string
 *               image:
 *                 type: string
 *                 format: binary
 *               countryCode:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               personalNumber:
 *                 type: string
 *               permenentAddress.street:
 *                 type: string
 *               permenentAddress.city:
 *                 type: string
 *               permenentAddress.state:
 *                 type: string
 *               permenentAddress.country:
 *                 type: string
 *               permenentAddress.zip:
 *                 type: string
 *               currentAddress.street:
 *                 type: string
 *               currentAddress.city:
 *                 type: string
 *               currentAddress.state:
 *                 type: string
 *               currentAddress.country:
 *                 type: string
 *               currentAddress.zip:
 *                 type: string
 *               gender:
 *                 type: string
 *               managerId:
 *                 type: string
 *               designationId:
 *                 type: string
 *               teamId:
 *                 type: string
 *               primarySkills:
 *                 type: string
 *               secondarySkills:
 *                 type: string
 *               department:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               probationDate:
 *                 type: string
 *                 format: date
 *               panNo:
 *                 type: string
 *               aadharNo:
 *                 type: string
 *               pfNo:
 *                 type: string
 *               uanDetail:
 *                 type: string
 *               previousExperience:
 *                 type: string
 *               currentSalary:
 *                 type: Number
 *               bankDetails.accountNumber:
 *                 type: string
 *               bankDetails.ifscCode:
 *                 type: string
 *               bankDetails.branchName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Step completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *       400:
 *         description: Bad Request (e.g., missing userId in steps 2–4)
 *       500:
 *         description: Internal Server Error
 */

userRouter.post(
  "/add-user",
  authMiddleware,
  authorization,
  upload.single("image"),
  userCreate
);
/**
 * @swagger
 * /api/fetched-userdetails/{id}:
 *   get:
 *     summary: Get user by ID along with user details
 *     tags: [User Controller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 664b112b943ea05a2f27318c
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User fetched successfully
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
 *                   example: User fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     isDeleted:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     userDetails:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

userRouter.get("/fetched-userdetails/:id", getUserId);

/**
 * @swagger
 * /update-userdetails:
 *   put:
 *     summary: Update user details step-wise (1 to 4)
 *     tags:
 *       - User Controller
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - step
 *               - userId
 *             properties:
 *               step:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: Step number for updating specific user detail section
 *               userId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               personalNumber:
 *                 type: string
 *               currentAddress:
 *                 type: string
 *               permenentAddress:
 *                 type: string
 *               managerId:
 *                 type: string
 *               designationId:
 *                 type: string
 *               teamId:
 *                 type: string
 *               primarySkills:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *                 description: JSON array or stringified array
 *               secondarySkills:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *               department:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               probationDate:
 *                 type: string
 *                 format: date
 *               panNo:
 *                 type: string
 *               aadharNo:
 *                 type: string
 *               pfNo:
 *                 type: string
 *               uanDetail:
 *                 type: string
 *               previousExperience:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               branchName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

userRouter.put(
  "/update-userdetails",
  authMiddleware,
  authorization,
  upload.single("image"),
  updateUser
);
/**
 *  @openapi
 *
 *  /api/roles:
 *    get:
 *      tags:
 *        - User Controller
 *      summary : get all role api
 *      responses :
 *        '200':
 *          description : OK
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */
userRouter.get("/roles", getAllRole);

/**
 * @swagger
 * /api/user-list:
 *   get:
 *     summary: Get a list of users
 *     tags:
 *       - User Controller
 *     description: >
 *       Returns a list of users with optional filters like search and role.
 *       You can also disable pagination by setting `pagination=false`.
 *       By default, users with the "ADMIN" role are excluded.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by full name, first name, last name, or email.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the role to filter users by.
 *       - in: query
 *         name: pagination
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Pass "false" to disable pagination and fetch all project managers.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number (applies only when pagination is enabled).
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page (applies only when pagination is enabled).
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           example: createdAt
 *         description: Field to sort by (applies only when pagination is enabled).
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc, ASC, DESC, 1, -1]
 *         description: Sort order (ascending or descending).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users with total count and pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           isDeleted:
 *                             type: boolean
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           role:
 *                             type: string
 *                     totalUser:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */

userRouter.get("/user-list", authMiddleware, userList);



/**
 *  @openapi
 *  /api/resetpassword-link:
 *    post:
 *      tags: 
 *        - User Controller
 *      summary : Reset Password link 
 *      requestBody : 
 *        required : true
 *        content :
 *          application/json:
 *            schema: 
 *              type: object
 *              required :
 *                - email
 * 
 *              properties : 
 *                email :
 *                  type : string
 * 
 *      responses :
 *        '200':
 *          description : OK
 *        '400' : 
 *          descrription : Bad request
 *        '404' :
 *          description : Not found    
 */

userRouter.post("/resetpassword-link", forgotPassword);

/**
 * @openapi
 * /api/password-reset:
 *   post:
 *     tags: 
 *       - User Controller
 *     summary: Password Reset 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *       '400':
 *         description: Bad request
 */

userRouter.post(
  "/password-reset",

  resetPasswordForUser
);

userRouter.get('/user-list', authMiddleware, userList)

/**
 * @swagger
 * /api/user-delete/{id}:
 *   delete:
 *     summary: delete user
 *     tags: [User Controller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 664b112b943ea05a2f27318c
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User fetched successfully
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
 *                   example: User Delete successfully
 */
userRouter.delete('/user-delete/:id', authMiddleware, userDelete)
export default userRouter;
