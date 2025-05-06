const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");
const Competitions = require("./competitions");
const Challenges = require("./challenges");
const ParticipantsHasChallenges = require("./participantsHasChallenges");

// Relações entre Participants e Teams
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

// Relações entre Participants e Answers
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

// Relações entre Teams e Competitions
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

// Relações muitos-para-muitos entre Participants e Challenges
Participants.belongsToMany(Challenges, {
  through: "participants_has_challenges",
  foreignKey: "participants_id",
  otherKey: "challenges_id",
  as: "challenge",
});
Challenges.belongsToMany(Participants, {
  through: "participants_has_challenges",
  foreignKey: "challenges_id",
  otherKey: "participants_id",
  as: "participants",
});

// Relação direta entre ParticipantsHasChallenges e Challenges (para includes)
ParticipantsHasChallenges.belongsTo(Challenges, {
  foreignKey: "challenges_id",
  as: "challenge",
});
