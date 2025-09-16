// backend/src/models/Venda.js (VERSÃO CORRIGIDA)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Venda extends Model {}

Venda.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  metodo_pagamento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_venda: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // --- CAMPO CORRIGIDO ---
  funcionario_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'funcionarios',
      key: 'id',
    },
    allowNull: false,
  },
  // --- CAMPO CORRIGIDO ---
  caixa_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'caixas',
      key: 'id',
    },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Venda',
  tableName: 'vendas',
  timestamps: false,
});

module.exports = Venda;