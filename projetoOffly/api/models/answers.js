const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Participants = require("./participants"); // Importa o modelo Participants

const Answers = sequelize.define("Answers", {
  id_answers: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = Answers;
