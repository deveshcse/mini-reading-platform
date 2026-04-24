import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task CRUD API",
      version: "1.0.0",
      description: "API for managing tasks",
    },
  },
  apis: ["./src/modules/**/*.route.ts", "./src/modules/**/*.controller.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
