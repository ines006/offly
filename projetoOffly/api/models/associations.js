// models/associations.js

const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");
const Competitions = require("./competitions");
const Challenges = require("./challenges");
const ParticipantsHasChallenges = require("./participantsHasChallenges");
const ChallengeLevels = require("./challengeLevel");

// === Participants ↔ Teams ===
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
Teams.belongsTo(Participants, {
  foreignKey: "team_admin",
  targetKey: "id",
  as: "admin",
});


// === Participants ↔ Answers ===
Answers.hasOne(Participants, {
  foreignKey: "answers_id",
  sourceKey: "id",
  as: "participant",
});

Participants.belongsTo(Answers, {
  foreignKey: "answers_id",
  targetKey: "id",
  as: "answer",
});

// === Competitions ↔ Teams ===
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

// === Participants ↔ Challenges (many-to-many) ===
Participants.belongsToMany(Challenges, {
  through: ParticipantsHasChallenges,
  foreignKey: "participants_id",
  otherKey: "challenges_id",
  as: "challenges",
});

Challenges.belongsToMany(Participants, {
  through: ParticipantsHasChallenges,
  foreignKey: "challenges_id",
  otherKey: "participants_id",
  as: "participants",
});

// === ParticipantsHasChallenges ↔ Challenges ===
ParticipantsHasChallenges.belongsTo(Challenges, {
  foreignKey: "challenges_id",
  as: "challenge",
});

// === ParticipantsHasChallenges ↔ Participants ===
ParticipantsHasChallenges.belongsTo(Participants, {
  foreignKey: "participants_id",
  as: "participant",
});

// === Challenges ↔ ParticipantsHasChallenges (hasMany, para includes) ===
Challenges.hasMany(ParticipantsHasChallenges, {
  foreignKey: "challenges_id",
  as: "participantsHasChallenges",
});

// === Participants ↔ ParticipantsHasChallenges (hasMany, para includes) ===
Participants.hasMany(ParticipantsHasChallenges, {
  foreignKey: "participants_id",
  as: "participantsHasChallenges",
});

// === Challenges ↔ ChallengeLevels ===
Challenges.belongsTo(ChallengeLevels, {
  foreignKey: "challenge_levels_id",
  as: "level",
});