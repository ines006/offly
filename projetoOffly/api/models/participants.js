const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Desestruturação explícita
const Teams = require("./teams");

const Participants = sequelize.define(
  "participants",
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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    upload: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    answers_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    teams_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Teams",
        key: "id",
      },
    },
    teams_team_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "participants",
  }
);

module.exports = Participants;
