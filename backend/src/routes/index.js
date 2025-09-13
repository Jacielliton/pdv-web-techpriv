// pdv-web-techpriv\backend\src\routes\index.js
const { Router } = require('express');
const sequelize = require('../config/database'); // <--- 1. IMPORTE A CONEXÃO DO BANCO


// Importações
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const ProdutoController = require('../controllers/ProdutoController'); // <--- IMPORTE O NOVO CONTROLLER
const authMiddleware = require('../middlewares/auth');
const VendaController = require('../controllers/VendaController');
const DashboardController = require('../controllers/DashboardController');

const routes = new Router();

// --- Rota Pública de Health Check ---  <--- 2. ADICIONE ESTA ROTA
routes.get('/status', async (req, res) => {
  try {
    // Tenta autenticar no banco de dados
    await sequelize.authenticate();
    // Se conseguir, retorna sucesso
    res.json({ status: 'UP', database: 'connected' });
  } catch (error) {
    // Se falhar, retorna erro 503 (Serviço Indisponível)
    res.status(503).json({ 
      status: 'UP', 
      database: 'disconnected', 
      error: 'Não foi possível conectar ao banco de dados.'
    });
  }
});

// --- Rotas Públicas ---
routes.post('/login', SessionController.store);

// --- Middleware de Autenticação ---
routes.use(authMiddleware);

// --- Rotas Protegidas ---
// Rotas para funcionários
routes.post('/funcionarios', FuncionarioController.store);
routes.get('/funcionarios', FuncionarioController.index);
routes.put('/funcionarios/:id', FuncionarioController.update);
routes.delete('/funcionarios/:id', FuncionarioController.delete);

// Rotas para produtos  <--- ADICIONE ESTAS NOVAS ROTAS
routes.post('/produtos', ProdutoController.store);
routes.get('/produtos', ProdutoController.index);
routes.put('/produtos/:id', ProdutoController.update);
routes.delete('/produtos/:id', ProdutoController.delete);

// Rota para Vendas <--- ADICIONE ESTA NOVA ROTA
routes.post('/vendas', VendaController.store);
routes.get('/vendas', VendaController.index); 

// Rota para o Dashboard
routes.get('/dashboard/summary', DashboardController.getSummary);

module.exports = routes;