const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ParticipantsHasChallenges = sequelize.define(
  "ParticipantsHasChallenges",
  {
    participants_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    challenges_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    starting_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validated: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    streak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    challenge_levels_id_challenge_levels: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    challenge_types_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "participants_has_challenges",
  }
);

module.exports = ParticipantsHasChallenges;