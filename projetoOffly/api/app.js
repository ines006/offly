const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, testConnection } = require("./config/database");
const participantsRoutes = require("./routes/participantsRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use("/participants", participantsRoutes);

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
  })
  .catch((error) => {
    console.error("Erro ao iniciar o servidor:", error);
  });
