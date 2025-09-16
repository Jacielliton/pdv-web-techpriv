const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class MovimentacaoCaixa extends Model {}

MovimentacaoCaixa.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 'tipo' define se é uma entrada ou uma saída de dinheiro
  tipo: {
    type: DataTypes.ENUM('SANGRIA', 'SUPRIMENTO'),
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  observacao: {
    type: DataTypes.STRING,
    allowNull: true, // Um campo opcional para descrever o motivo
  },
  data_movimentacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // Chave estrangeira para saber a qual sessão de caixa esta movimentação pertence
  caixa_id: {
    type: DataTypes.INTEGER,
    references: { model: 'caixas', key: 'id' },
    allowNull: false,
  },
  // Chave estrangeira para saber qual funcionário fez a movimentação
  funcionario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'funcionarios', key: 'id' },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'MovimentacaoCaixa',
  tableName: 'movimentacoes_caixa',
  timestamps: false,
});

module.exports = MovimentacaoCaixa;