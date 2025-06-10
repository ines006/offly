const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ChallengeLevels = sequelize.define('ChallengeLevels', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_level: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'challenge_levels',
  timestamps: false, 
});

module.exports = ChallengeLevels;
