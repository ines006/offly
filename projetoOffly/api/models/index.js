const { sequelize, testConnection } = require("../config/database");

// Importar todos os modelos
const Participants = require("./participants");
const Teams = require("./teams");
const Answers = require("./answers");
const Competitions = require("./competitions");
const Challenges = require("./challenges");
const ParticipantsHasChallenges = require("./participantsHasChallenges");

// ⚠️ Importar e aplicar as associações
require("./associations");

// Exportar tudo
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
