// pdv-web-techpriv/backend/src/routes/index.js (VERSÃO CORRIGIDA)
const { Router } = require('express');
const sequelize = require('../config/database');

// Importações dos Controllers
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const ProdutoController = require('../controllers/ProdutoController');
const VendaController = require('../controllers/VendaController');
const DashboardController = require('../controllers/DashboardController');
const PagSeguroController = require('../controllers/PagSeguroController');

// Importações dos Middlewares (ESTAVAM FALTANDO)
const authMiddleware = require('../middlewares/auth');
const authManagerMiddleware = require('../middlewares/authManager');

const routes = new Router();

// --- Rota Pública de Health Check ---
routes.get('/status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'UP', database: 'connected' });
  } catch (error) {
    res.status(503).json({ 
      status: 'UP', 
      database: 'disconnected', 
      error: 'Não foi possível conectar ao banco de dados.'
    });
  }
});

// --- Rota Pública de Login ---
routes.post('/login', SessionController.store);

// --- Middleware de Autenticação (para todas as rotas abaixo) ---
routes.use(authMiddleware);

// --- Rotas para TODOS os funcionários logados (Caixas e Gerentes) ---
routes.post('/vendas', VendaController.store);
routes.get('/produtos', ProdutoController.index);
routes.post('/pagamento/pagseguro/order', PagSeguroController.createOrder);
routes.get('/pagamento/pagseguro/devices', PagSeguroController.listDevices);

// --- Middleware de Autorização (para todas as rotas abaixo) ---
routes.use(authManagerMiddleware);

// --- Rotas exclusivas para GERENTES ---
routes.get('/funcionarios', FuncionarioController.index);
routes.post('/funcionarios', FuncionarioController.store);
routes.put('/funcionarios/:id', FuncionarioController.update);
routes.delete('/funcionarios/:id', FuncionarioController.delete);

routes.post('/produtos', ProdutoController.store);
routes.put('/produtos/:id', ProdutoController.update);
routes.delete('/produtos/:id', ProdutoController.delete);

routes.get('/vendas', VendaController.index);
routes.get('/dashboard/summary', DashboardController.getSummary);

module.exports = routes;