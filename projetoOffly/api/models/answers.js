const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Answers = sequelize.define(
  "answers",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    answers: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "answers",
  }
);

module.exports = Answers;
