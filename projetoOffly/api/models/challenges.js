const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const ParticipantsHasChallenges = require("./participantsHasChallenges");


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

Challenges.hasMany(ParticipantsHasChallenges, {
  foreignKey: "challenges_id",
});

ParticipantsHasChallenges.belongsTo(Challenges, {
  foreignKey: "challenges_id",
});

module.exports = Challenges;
