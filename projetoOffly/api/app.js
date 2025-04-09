const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, testConnection } = require("./models"); // Importa do index.js
const participantsRoutes = require("./routes/participantsRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const authRoutes = require("./routes/authRoutes");
const { swaggerUi, specs } = require("./config/swagger"); // 🚀 Swagger

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(bodyParser.json());

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Rotas
app.use("/participants", participantsRoutes);
app.use("/teams", teamsRoutes);
app.use("/auth", authRoutes);

// Testar a conexão e sincronizar a base de dados
testConnection()
.then(() => {
  return sequelize.sync();
})
.then(() => {
  console.log("📌 Base de dados conectada!");
  app.listen(PORT, () =>
    console.log(`🚀 Servidor a funcionar na porta ${PORT}`));
  console.log(`📚 Swagger disponível em http://localhost:${PORT}/api-docs`);
})
.catch((error) => {
  console.error("Erro ao iniciar o servidor:", error);
});


