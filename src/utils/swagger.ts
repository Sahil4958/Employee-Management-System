import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Management API",
      version: "1.0.0",
      description: "API documentation for Employee Management System",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
      {
        url: "https://employee-management-a8yl.onrender.com",
      },
    ],
  },
  apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express, _PORT: string | undefined) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
