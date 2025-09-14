// pdv-web-techpriv\backend\src\routes\index.js
const { Router } = require('express');
const sequelize = require('../config/database'); // <--- 1. IMPORTE A CONEXÃO DO BANCO


// Importações
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const ProdutoController = require('../controllers/ProdutoController'); // <--- IMPORTE O NOVO CONTROLLER
const authMiddleware = require('../middlewares/auth');
const authManagerMiddleware = require('../middlewares/authManager');
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

// --- Rota Pública de Login ---
routes.post('/login', SessionController.store);


// --- Middleware de Autenticação (para todas as rotas abaixo) ---
// Garante que o usuário está logado
routes.use(authMiddleware);

// --- Rotas Acessíveis por Todos os Usuários Logados ---
// Um caixa precisa acessar a rota de vendas para registrar uma transação.
routes.post('/vendas', VendaController.store);
routes.get('/produtos', ProdutoController.index); 


// --- Middleware de Autorização (para todas as rotas abaixo) ---
// Garante que, além de logado, o usuário seja um gerente
routes.use(authManagerMiddleware);

// --- Rotas Protegidas para Gerentes ---
// Funcionários
routes.post('/funcionarios', FuncionarioController.store);
routes.get('/funcionarios', FuncionarioController.index);
routes.put('/funcionarios/:id', FuncionarioController.update);
routes.delete('/funcionarios/:id', FuncionarioController.delete);

// Produtos
routes.post('/produtos', ProdutoController.store);
routes.put('/produtos/:id', ProdutoController.update);
routes.delete('/produtos/:id', ProdutoController.delete);

// Histórico de Vendas
routes.get('/vendas', VendaController.index);

// Dashboard
routes.get('/dashboard/summary', DashboardController.getSummary);

module.exports = routes;