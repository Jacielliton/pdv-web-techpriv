const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Venda extends Model {}

Venda.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  funcionario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  metodo_pagamento: {
    type: DataTypes.STRING,
  },
  data_venda: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Venda',
  tableName: 'vendas',
  timestamps: false, // Desabilitamos porque já temos 'data_venda'
});

module.exports = Venda;