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
      unique: true,
      validate: {
        len: [3, 40],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 60],
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 3,
        max: 5,
      },
    },
    visibility: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
    competitions_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_passbooks_id: {
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
