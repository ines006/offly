const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Teams = sequelize.define(
  "Teams",
  {
    id_teams: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    competions_id_competions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_passbooks_id_team_passbooks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "teams",
  }
);

module.exports = Teams;
