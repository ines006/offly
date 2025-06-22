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

  apis: ["./api/routes/*.js"],

};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
