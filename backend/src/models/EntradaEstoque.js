const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class EntradaEstoque extends Model {}
EntradaEstoque.init({
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  preco_custo_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  data_entrada: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'EntradaEstoque', tableName: 'entradas_estoque', timestamps: false });
module.exports = EntradaEstoque;