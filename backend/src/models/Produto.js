// backend/src/models/Produto.js (VERSÃO FINAL E CORRIGIDA)
const { Model, DataTypes } = require('sequelize');
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
  // ===================================================================
  // CAMPOS QUE FALTAVAM
  // ===================================================================
  preco_custo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Pode ser nulo até a primeira entrada
  },
  estoque_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10, // Define um valor padrão
  },
  // ===================================================================
  quantidade_estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  codigo_barras: {
    type: DataTypes.STRING,
    unique: true,
  },
grupo_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou false se for obrigatório
    references: {
      model: 'grupos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Se um grupo for deletado, o produto fica sem grupo
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Ou false se for obrigatório
    references: {
      model: 'categorias',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Se uma categoria for deletada, o produto fica sem categoria
  },

}, {
  sequelize,
  modelName: 'Produto',
  tableName: 'produtos',
  timestamps: false,
});

module.exports = Produto;