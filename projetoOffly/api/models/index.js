const { sequelize, testConnection } = require("../config/database");
const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");
const Competitions = require("./competitions");
const Challenges = require("./challenges");
const ParticipantsHasChallenges = require("./participantsHasChallenges");

// Definir relações entre as tabelas
Teams.hasMany(Participants, {
  foreignKey: "teams_id_teams",
  sourceKey: "id_teams",
  as: "participants",
});
Participants.belongsTo(Teams, {
  foreignKey: "teams_id_teams",
  targetKey: "id_teams",
  as: "team",
});

Participants.belongsTo(Answers, {
  foreignKey: "answers_id_answers",
  targetKey: "id_answers",
  as: "answer",
});
Answers.hasOne(Participants, {
  foreignKey: "answers_id_answers",
  sourceKey: "id_answers",
  as: "participant",
});

Competitions.hasMany(Teams, {
  foreignKey: "competitions_id_competitions",
  sourceKey: "id_competitions",
  as: "teams",
});
Teams.belongsTo(Competitions, {
  foreignKey: "competitions_id_competitions",
  targetKey: "id_competitions",
  as: "competition",
});

Participants.belongsToMany(Challenges, {
  through: ParticipantsHasChallenges,
  foreignKey: "participants_id_participants",
  otherKey: "challenges_id_challenges",
});
Challenges.belongsToMany(Participants, {
  through: ParticipantsHasChallenges,
  foreignKey: "challenges_id_challenges",
  otherKey: "participants_id_participants",
});

ParticipantsHasChallenges.belongsTo(Participants, {
  foreignKey: "participants_id_participants",
  targetKey: "id_participants",
});
ParticipantsHasChallenges.belongsTo(Challenges, {
  foreignKey: "challenges_id_challenges",
  targetKey: "id_challenges",
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
