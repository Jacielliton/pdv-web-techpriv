// pdv-web-techpriv\backend\src\models\Produto.js
const { DataTypes, Model } = require('sequelize');
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
    type: DataTypes.DECIMAL(10, 2), // Usamos DECIMAL para precisão monetária
    allowNull: false,
  },
  quantidade_estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  codigo_barras: {
    type: DataTypes.STRING,
    unique: true,
  },
  // O campo data_cadastro é gerenciado pelo banco de dados, então não precisamos dele aqui
}, {
  sequelize,
  modelName: 'Produto',
  tableName: 'produtos',
  timestamps: false, // Desabilitamos os campos createdAt e updatedAt automáticos
});

module.exports = Produto;