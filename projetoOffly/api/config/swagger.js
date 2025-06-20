const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Offly",
      version: "1.0.0",
      description: "Offly API Documentation",
    },
    servers: [
      {
        //url: "http://localhost:3010",
        url: "https://offly.onrender.com",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  //apis: ["./routes/*.js"],
  apis: ["./api/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
