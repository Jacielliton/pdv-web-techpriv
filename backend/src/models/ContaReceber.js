const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ContaReceber extends Model {}
ContaReceber.init({
  valor_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  valor_pago: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ABERTA' },
  data_vencimento: { type: DataTypes.DATE },
}, { sequelize, modelName: 'ContaReceber', tableName: 'contas_receber', timestamps: false });
module.exports = ContaReceber;