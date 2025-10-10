// backend/src/server.js (VERSÃO COM RETORNO DE ERRO)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database'); // Ele vai ler a variável de ambiente automaticamente
const routes = require('./routes/index');
const applyAssociations = require('./models/associations');
const createAdminUser = require('./database/seeders/admin-user');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
applyAssociations();

app.use('/api', routes);

const frontendBuildPath = path.resolve(__dirname, '..', '..', 'frontend', 'cadastro-funcionarios', 'build');
app.use(express.static(frontendBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3333;

// A função de início agora aceita variáveis de ambiente do processo pai
const startServer = async (logCallback, statusCallback, env) => {
  // Mescla as variáveis de ambiente recebidas com as existentes
  process.env = { ...process.env, ...env };

  const log = logCallback || console.log;
  const status = statusCallback || console.log;

  try {
    await sequelize.authenticate();
    log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    await createAdminUser();
    
    app.listen(PORT, '0.0.0.0', () => {
      log(`🚀 Servidor unificado rodando na porta ${PORT} e acessível na rede`);
      status('Online');
    });
  } catch (error) {
    log(`❌ Não foi possível iniciar o servidor: ${error.stack || error.toString()}`);
    // ---> MUDANÇA AQUI: Passamos o objeto 'error' para o statusCallback <---
    status('Erro', error);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;