const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, testConnection } = require("./models"); // Importa do index.js
const participantsRoutes = require("./routes/participantsRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const authRoutes = require("./routes/authRoutes");
const { swaggerUi, specs } = require("./config/swagger");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

const corsOptions = {
  origin: "http://localhost:8081", // ou "*" apenas para testes
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // caso uses cookies ou headers de auth
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Rotas
app.use("/auth", authRoutes);
app.use("/participants", participantsRoutes);
app.use("/teams", teamsRoutes);

// Testar a conexão e sincronizar a base de dados
testConnection()
  .then(() => {
    return sequelize.sync();
  })
  .then(() => {
    console.log("📌 Base de dados conectada!");
    app.listen(PORT, () =>
      console.log(`🚀 Servidor a funcionar na porta ${PORT}`)
    );
    console.log(`📚 Swagger disponível em http://localhost:${PORT}/api-docs`);
  })
  .catch((error) => {
    console.error("Erro ao iniciar o servidor:", error);
  });
