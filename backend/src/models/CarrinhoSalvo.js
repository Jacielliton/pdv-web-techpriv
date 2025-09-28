// backend/src/models/CarrinhoSalvo.js (NOVO ARQUIVO)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CarrinhoSalvo extends Model {}

CarrinhoSalvo.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Conteúdo do carrinho será guardado como um JSON
  conteudo: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [], // Por padrão, um carrinho vazio
  },
  // Valor do desconto
  desconto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  // Chave estrangeira para o funcionário (dono do carrinho)
  funcionario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Garante que cada funcionário tenha apenas um carrinho salvo
    references: {
      model: 'funcionarios',
      key: 'id',
    },
  },
  // Chave estrangeira para o cliente associado (opcional)
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id',
    },
  },
  // Chave estrangeira para o vendedor associado (opcional)
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'funcionarios', // Vendedor também é um funcionário
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'CarrinhoSalvo',
  tableName: 'carrinhos_salvos',
  timestamps: true, // createdAt e updatedAt são úteis aqui
});

module.exports = CarrinhoSalvo;