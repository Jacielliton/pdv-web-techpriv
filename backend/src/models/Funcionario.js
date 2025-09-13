// pdv-web-techpriv\backend\src\models\Funcionario.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class Funcionario extends Model {}

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
  cargo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // O campo no banco é 'senha_hash', mas no modelo podemos chamar de 'senha'
  // e o hook cuidará da transformação.
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Funcionario',
  tableName: 'funcionarios',
  timestamps: false, // Desabilitar createdAt e updatedAt automáticos
  hooks: {
    // Hook para gerar o hash da senha antes de criar o funcionário
    beforeCreate: async (funcionario) => {
      if (funcionario.senha_hash) {
        const salt = await bcrypt.genSalt(10);
        funcionario.senha_hash = await bcrypt.hash(funcionario.senha_hash, salt);
      }
    },
    // ADICIONE ESTE NOVO HOOK
    beforeUpdate: async (funcionario) => {
      // Verifica se o campo senha_hash foi modificado
      if (funcionario.changed('senha_hash')) {
        const salt = await bcrypt.genSalt(10);
        funcionario.senha_hash = await bcrypt.hash(funcionario.senha_hash, salt);
      }
    }
  },
  
});

module.exports = Funcionario;