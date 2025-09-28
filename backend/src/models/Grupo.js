// backend/src/models/Grupo.js (NOVO ARQUIVO)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Grupo extends Model {}

Grupo.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Grupo',
  tableName: 'grupos',
  timestamps: false,
});

module.exports = Grupo;