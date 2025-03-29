require("dotenv").config({ path: "../.env" });

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Desativar logs de queries no console
    define: {
      timestamps: false,
    },
  }
);

// Testar a conexão à base de dados

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com a base de dados estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar à base de dados:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
