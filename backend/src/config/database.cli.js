// backend/src/config/database.cli.js (NOVO ARQUIVO)
require('dotenv').config();

// Este objeto simples é o que o Sequelize CLI espera
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres'
};

// O CLI procura por chaves de ambiente (development, production). 
// Vamos exportar nossa configuração para os ambientes que usamos.
module.exports = {
  development: config,
  production: config 
};