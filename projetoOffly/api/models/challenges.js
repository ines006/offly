const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Challenges = sequelize.define(
  "Challenges",
  {
    id_challenges: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    challenge_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "challenges",
  }
);

module.exports = Challenges;
