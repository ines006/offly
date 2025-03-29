const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Desestruturação explícita

const Participants = sequelize.define("participants", {
  id_participants: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  participant_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  participant_username: {
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
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  participant_gender: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  upload: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  answers_id_answers: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teams_id_teams: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teams_team_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

module.exports = Participants;
