//pdv-web-techpriv\backend\src\models\PagamentoConta.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class PagamentoConta extends Model {}

PagamentoConta.init({
  // Campos existentes
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  metodo_pagamento: { type: DataTypes.STRING, allowNull: false },
  data_pagamento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  // ===================================================================
  // CAMPOS ADICIONADOS - ESSENCIAL PARA A CORREÇÃO
  // ===================================================================
  conta_id: {
    type: DataTypes.INTEGER,
    references: { model: 'contas_receber', key: 'id' },
    allowNull: false,
  },
  caixa_id: {
    type: DataTypes.INTEGER,
    references: { model: 'caixas', key: 'id' },
    allowNull: false,
  },
  funcionario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'funcionarios', key: 'id' },
    allowNull: false,
  },
  // ===================================================================

}, { sequelize, modelName: 'PagamentoConta', tableName: 'pagamentos_conta', timestamps: false });

module.exports = PagamentoConta;