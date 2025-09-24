const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Fornecedor extends Model {}
Fornecedor.init({
  nome_fantasia: { type: DataTypes.STRING, allowNull: false },
  razao_social: { type: DataTypes.STRING },
  cnpj: { type: DataTypes.STRING, unique: true },
  telefone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  endereco: { type: DataTypes.TEXT },
}, { sequelize, modelName: 'Fornecedor', tableName: 'fornecedores', timestamps: false });
module.exports = Fornecedor;