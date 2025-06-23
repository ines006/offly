const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ChallengesHasTeams = sequelize.define(
  "ChallengesHasTeams",
  {
      challenges_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      teams_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      teams_team_admin: {
        type: DataTypes.INTEGER,
      },
      starting_date: {
        type: DataTypes.DATE,
      },
      end_date: {
        type: DataTypes.DATE,
      },
      validated: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: 'challenges_has_teams',
      timestamps: false,
    }
  );

module.exports = ChallengesHasTeams;



