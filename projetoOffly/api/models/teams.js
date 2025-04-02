const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Teams = sequelize.define(
  "Teams",
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    competitions_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_passbooks_id_team_passbooks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "teams",
  }
);

module.exports = Teams;
