const { sequelize, testConnection } = require("../config/database");
const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");
const Competitions = require("./competitions");
const Challenges = require("./challenges");
const ParticipantsHasChallenges = require("./participantsHasChallenges");

// Definir relações entre as tabelas
Teams.hasMany(Participants, {
  foreignKey: "teams_id",
  sourceKey: "id",
  as: "participants",
});
Participants.belongsTo(Teams, {
  foreignKey: "teams_id",
  targetKey: "id",
  as: "team",
});

Participants.belongsTo(Answers, {
  foreignKey: "answers_id",
  targetKey: "id",
  as: "answer",
});
Answers.hasOne(Participants, {
  foreignKey: "answers_id",
  sourceKey: "id",
  as: "participant",
});

Competitions.hasMany(Teams, {
  foreignKey: "competitions_id",
  sourceKey: "id",
  as: "teams",
});
Teams.belongsTo(Competitions, {
  foreignKey: "competitions_id",
  targetKey: "id",
  as: "competition",
});

Participants.belongsToMany(Challenges, {
  through: ParticipantsHasChallenges,
  foreignKey: "participants_id",
  otherKey: "challenges_id",
});
Challenges.belongsToMany(Participants, {
  through: ParticipantsHasChallenges,
  foreignKey: "challenges_id",
  otherKey: "participants_id",
});

ParticipantsHasChallenges.belongsTo(Participants, {
  foreignKey: "participants_id",
  targetKey: "id",
});
ParticipantsHasChallenges.belongsTo(Challenges, {
  foreignKey: "challenges_id",
  targetKey: "id",
});

module.exports = {
  sequelize,
  testConnection,
  Participants,
  Teams,
  Answers,
  Competitions,
  Challenges,
  ParticipantsHasChallenges,
};
