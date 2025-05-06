const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, testConnection } = require("./models");
const participantsRoutes = require("./routes/participantsRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const authRoutes = require("./routes/authRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const participantsHasChallengesRoutes = require("./routes/participantsHasChallengesRoutes");
const { swaggerUi, specs } = require("./config/swagger");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware para logging detalhado
app.use((req, res, next) => {
  const start = Date.now();
  console.log(
    `📡 [${new Date().toISOString()}] Requisição recebida: ${req.method} ${
      req.url
    }`
  );
  console.log(`🔍 Headers:`, req.headers);
  console.log(`📋 Corpo da requisição:`, req.body);
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📤 [${new Date().toISOString()}] Resposta enviada para ${req.url}:`,
      {
        status: res.statusCode,
        duration: `${duration}ms`,
        body:
          typeof res.body === "string"
            ? res.body.slice(0, 100) + "..."
            : res.body,
      }
    );
  });
  next();
});

// Configuração de CORS
app.use(
  cors({
    origin: "*", // Permitir todas as origens para testes com ngrok
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
      "Accept",
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Rotas da aplicação
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/auth", authRoutes);
app.use("/participants", participantsRoutes);
app.use("/teams", teamsRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/participants-has-challenges", participantsHasChallengesRoutes);

// Testar conexão e iniciar servidor
testConnection()
  .then(() => {
    console.log("🔗 Tentando sincronizar base de dados...");
    return sequelize.sync();
  })
  .then(() => {
    console.log("📌 Base de dados conectada com sucesso!");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📚 Swagger disponível em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao iniciar o servidor:", error);
  });
