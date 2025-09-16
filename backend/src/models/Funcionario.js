// backend/src/models/Funcionario.js (VERSÃO SIMPLIFICADA E FINAL)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class Funcionario extends Model {
  // A única responsabilidade do modelo é checar a senha
  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

Funcionario.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha_hash: { type: DataTypes.STRING, allowNull: false }, // Apenas o campo real
  cargo: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Funcionario',
  tableName: 'funcionarios',
  timestamps: false,
  // O campo virtual 'senha' e a seção 'hooks' foram removidos
  defaultScope: {
    attributes: { exclude: ['senha_hash'] },
  },
});

module.exports = Funcionario;