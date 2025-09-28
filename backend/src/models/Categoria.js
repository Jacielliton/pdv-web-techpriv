// backend/src/models/Categoria.js (NOVO ARQUIVO)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Categoria extends Model {}

Categoria.init({
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
  modelName: 'Categoria',
  tableName: 'categorias',
  timestamps: false,
});

module.exports = Categoria;