// pdv-web-techpriv\backend\src\config\database.js (VERSÃO ATUALIZADA)
require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // O banco de dados agora será um arquivo na pasta raiz do backend
  storage: path.resolve(__dirname, '..', '..', 'database.sqlite'),
  logging: false,
});

module.exports = sequelize;