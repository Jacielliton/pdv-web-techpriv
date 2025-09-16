const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class Funcionario extends Model {
  checkPassword(senha) {
    if (!senha || !this.senha_hash) return false;
    return bcrypt.compare(senha, this.senha_hash);
  }
}

Funcionario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.VIRTUAL,
    validate: {
      notEmpty: {
        msg: 'O campo senha não pode ser vazio.'
      }
    }
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Funcionario',
  tableName: 'funcionarios',
  timestamps: false,
  hooks: {
    beforeCreate: async (funcionario) => {
      if (funcionario.senha) {
        funcionario.senha_hash = await bcrypt.hash(funcionario.senha, 8);
      }
    },
    beforeUpdate: async (funcionario) => {
      if (funcionario.senha) {
        funcionario.senha_hash = await bcrypt.hash(funcionario.senha, 8);
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['senha_hash'] },
  },
});

module.exports = Funcionario;