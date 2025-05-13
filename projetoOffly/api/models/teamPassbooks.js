const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TeamPassbooks = sequelize.define(
  "TeamPassbooks",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    competitions_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "team_passbooks",
    timestamps: false,
  }
);

module.exports = TeamPassbooks;
