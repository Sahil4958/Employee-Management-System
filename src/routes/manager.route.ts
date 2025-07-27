// import express from "express";
// import {
//   createManager,
//   deleteManager,
//   getAllManagers,
//   getManagerById,
//   updateManager,
// } from "../controllers/manager.controller";
// import { authMiddleware } from "../middlewares/auth.middleware";
// import { authorization } from "../middlewares/validate.middleware";

// const managerRouter = express.Router();

// /**
//  * @openapi
//  * components:
//  *   securitySchemes:
//  *     bearerAuth:
//  *       type: http
//  *       scheme: bearer
//  *       bearerFormat: JWT
//  */

// /**
//  *  @openapi
//  *  /api/create-manager:
//  *    post:
//  *      tags:
//  *        - Manager Controller
//  *      security:
//  *       - bearerAuth: []
//  *      summary : Create a Manager
//  *      requestBody :
//  *        required : true
//  *        content :
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              required :
//  *                - label
//  *              properties :
//  *                label :
//  *                  type : string
//  *
//  *
//  *      responses :
//  *        '201':
//  *          description : Created
//  *        '400' :
//  *          descrription : Bad request
//  *        '404' :
//  *          description : Not found
//  */

// managerRouter.post(
//   "/create-manager",
//   authMiddleware,
//   authorization,
//   createManager
// );

// /**
//  *  @openapi
//  *  /api/managers:
//  *    get:
//  *      security:
//  *       - bearerAuth: []
//  *      tags:
//  *        - Manager Controller
//  *      summary : Get all Managers
//  *      responses :
//  *        '200':
//  *          description : OK
//  *        '404' :
//  *          description : Not found
//  */
// managerRouter.get("/managers", authMiddleware, authorization, getAllManagers);

// /**
//  *  @openapi
//  *  /api/manager/{id}:
//  *    get:
//  *      security:
//  *       - bearerAuth: []
//  *      tags:
//  *        - Manager Controller
//  *      summary : Get a Manager by ID
//  *      parameters:
//  *        - in: path
//  *          name: id
//  *          required: true
//  *          schema:
//  *            type: string
//  *      responses :
//  *        '200':
//  *          description : OK
//  *
//  *
//  *        '404' :
//  *          description : Not found
//  */
// managerRouter.get(
//   "/manager/:id",
//   authMiddleware,
//   authorization,
//   getManagerById
// );

// /**
//  *  @openapi
//  *  /api/update-manager/{id}:
//  *    patch:
//  *      security:
//  *       - bearerAuth: []
//  *      tags:
//  *        - Manager Controller
//  *      summary : Update a Manager by ID
//  *      parameters:
//  *        - in: path
//  *          name: id
//  *          required: true
//  *          schema:
//  *            type: string
//  *      requestBody :
//  *        required : true
//  *        content :
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              required :
//  *                - label
//  *              properties :
//  *                label :
//  *                  type : string
//  *
//  *      responses :
//  *        '200':
//  *          description : OK
//  *        '404' :
//  *          description : Not found
//  */
// managerRouter.patch(
//   "/update-manager/:id",
//   authMiddleware,
//   authorization,
//   updateManager
// );

// /**
//  *  @openapi
//  *  /api/delete-manager/{id}:
//  *    delete:
//  *      security:
//  *       - bearerAuth: []
//  *      tags:
//  *        - Manager Controller
//  *      summary : Delete a Manager by ID
//  *      parameters:
//  *        - in: path
//  *          name: id
//  *          required: true
//  *          schema:
//  *            type: string
//  *      responses :
//  *        '200':
//  *          description : OK
//  *        '404' :
//  *          description : Not found
//  */
// managerRouter.delete(
//   "/delete-manager/:id",
//   authMiddleware,
//   authorization,
//   deleteManager
// );

// export default managerRouter;
