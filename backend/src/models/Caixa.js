const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Caixa extends Model {}

Caixa.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  data_abertura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  data_fechamento: {
    type: DataTypes.DATE,
    allowNull: true, // Fica nulo enquanto o caixa estiver aberto
  },
  valor_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  valor_final_calculado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Será preenchido no fechamento
  },
  valor_final_informado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Será informado pelo usuário
  },
  diferenca: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // (valor_final_informado - valor_final_calculado)
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ABERTO', // Status pode ser 'ABERTO' ou 'FECHADO'
  },
  funcionario_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'funcionarios', // Nome da tabela de funcionários
      key: 'id',
    },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Caixa',
  tableName: 'caixas', // Definindo o nome da tabela explicitamente
  timestamps: false,
});

module.exports = Caixa;