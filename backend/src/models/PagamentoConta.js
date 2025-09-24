const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class PagamentoConta extends Model {}
PagamentoConta.init({
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  metodo_pagamento: { type: DataTypes.STRING, allowNull: false },
  data_pagamento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'PagamentoConta', tableName: 'pagamentos_conta', timestamps: false });
module.exports = PagamentoConta;