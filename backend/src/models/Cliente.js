// backend/src/models/Cliente.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Cliente extends Model {}

Cliente.init({
  nome: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, unique: true },
  telefone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  endereco: { type: DataTypes.TEXT },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Cliente',
  tableName: 'clientes',
  timestamps: false
});

module.exports = Cliente;