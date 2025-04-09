// api/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Offly",
      version: "1.0.0",
      description: "Documentação da API do projeto Offly",
    },
    servers: [
      {
        url: "http://localhost:3010",
      },
    ],
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ],
  },
  apis: ["./routes/*.js"], // Ajuste este caminho conforme necessário
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
