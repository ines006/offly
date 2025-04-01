const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Competitions = sequelize.define(
  "Competitions",
  {
    id_competitions: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
