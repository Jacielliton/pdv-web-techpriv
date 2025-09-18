// backend/src/models/Produto.js (VERSÃO CORRIGIDA E FINAL)
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Produto extends Model {}

Produto.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantidade_estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  codigo_barras: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Produto',
  // --- LINHA ADICIONADA ---
  // Garante que o nome da tabela seja sempre 'produtos' em minúsculo
  tableName: 'produtos', 
  // -------------------------
  timestamps: false,
});

module.exports = Produto;