// models/challenges.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Challenges = sequelize.define(
  "Challenges",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "challenges",
  }
);

module.exports = Challenges;
