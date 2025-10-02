// backend/src/models/Funcionario.js (VERSÃO CORRIGIDA)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class Funcionario extends Model {
  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

Funcionario.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha_hash: { type: DataTypes.STRING, allowNull: false },
  cargo: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Funcionario',
  // CORREÇÃO: Garante que o nome da tabela seja sempre 'funcionarios' (minúsculo)
  tableName: 'funcionarios',
  timestamps: false,
  defaultScope: {
    attributes: { exclude: ['senha_hash'] },
  },
});

module.exports = Funcionario;