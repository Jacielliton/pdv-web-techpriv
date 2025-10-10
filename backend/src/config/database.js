// backend/src/config/database.js (VERSÃO FINAL E CORRIGIDA)
const { Sequelize } = require('sequelize');
const path = require('path');

// Lê o caminho do DB da variável de ambiente. Se não existir, usa um caminho local padrão.
const storagePath = process.env.DB_STORAGE_PATH || path.resolve(__dirname, '..', '..', 'database.sqlite');

// Cria o objeto de configuração
const config = {
  dialect: 'sqlite',
  storage: storagePath,
  logging: false, 
};

// --- CORREÇÃO APLICADA AQUI ---
// Cria a instância do Sequelize com a configuração e a exporta
const sequelize = new Sequelize(config);

module.exports = sequelize;