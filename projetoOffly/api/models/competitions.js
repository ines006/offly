const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Competitions = sequelize.define(
  "Competitions",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    players: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    starting_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "competitions",
  }
);

module.exports = Competitions;
