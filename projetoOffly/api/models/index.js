const { sequelize, testConnection } = require("../config/database");
const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");

// Definir relações entre as tabelas

Teams.hasMany(Participants, {
  foreignKey: "teams_id_teams",
  sourceKey: "id_teams",
});
Participants.belongsTo(Teams, {
  foreignKey: "teams_id_teams",
  targetKey: "id_teams",
});

Participants.belongsTo(Answers, {
  foreignKey: "answers_id_answers",
  targetKey: "id_answers",
  as: "answer",
});
Answers.hasOne(Participants, {
  foreignKey: "answers_id_answers",
  sourceKey: "id_answers",
});

module.exports = {
  sequelize,
  testConnection,
  Participants,
  Teams,
  Answers,
};
