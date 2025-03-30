const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Answers = sequelize.define(
  "answers",
  {
    id_answers: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "answers",
  }
);

module.exports = Answers;
