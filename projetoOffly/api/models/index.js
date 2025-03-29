const { sequelize, testConnection } = require("../config/database");
const Participants = require("./participants");
const Teams = require("./teams");

//Definir relações entre tabelas

Teams.hasMany(Participants, {
  foreignKey: "teams_id_teams",
  sourceKey: "id_teams",
});
Participants.belongsTo(Teams, {
  foreignKey: "teams_id_teams",
  targetKey: "id_teams",
});

module.exports = {
  sequelize,
  testConnection,
  Participants,
  Teams,
};
