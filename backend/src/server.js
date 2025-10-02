// backend/src/server.js (VERSÃO FINAL E ESTÁVEL)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Corrigido o import do morgan
const sequelize = require('./config/database');
const routes = require('./routes/index');
const applyAssociations = require('./models/associations');
const createAdminUser = require('./database/seeders/admin-user');

const app = express();

// Middlewares
app.use(cors({
  origin: '*' // Permite acesso de qualquer origem
}));
app.use(morgan('dev')); // Usando o morgan corretamente
app.use(express.json());

// Aplica as associações entre os models
applyAssociations();

// Define o prefixo /api para todas as rotas
app.use('/api', routes);

const PORT = process.env.PORT || 3333;

// Função principal para iniciar o servidor
const startServer = async () => {
  try {
    // 1. Tenta autenticar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

    // 2. Garante que o usuário administrador exista (cria se não existir)
    await createAdminUser();

    // 3. Inicia o servidor, sem tentar alterar o banco de dados (sem sync)
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Não foi possível iniciar o servidor:', error);
  }
};

// Inicia a aplicação
startServer();

module.exports = app;