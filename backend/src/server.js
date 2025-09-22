// backend/src/server.js (VERSÃO CORRIGIDA E OTIMIZADA)

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');
const routes = require('./routes/index');
const applyAssociations = require('./models/associations'); // 1. IMPORTE O ARQUIVO DE ASSOCIAÇÕES

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 2. CHAME A FUNÇÃO PARA APLICAR TODAS AS ASSOCIAÇÕES DE UMA SÓ VEZ
applyAssociations();

app.use('/api', routes);

const PORT = process.env.PORT || 3333;

if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
      // O { alter: true } é ótimo para desenvolvimento. Em produção, considere usar migrations.
      return sequelize.sync({ alter: true });
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ Não foi possível conectar ao banco de dados:', err);
    });
}

module.exports = app;