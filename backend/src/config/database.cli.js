// backend/src/config/database.cli.js (VERSÃO ATUALIZADA)
require('dotenv').config();
const path = require('path');

const config = {
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '..', '..', 'database.sqlite'),
};

module.exports = {
  development: config,
  production: config,
};