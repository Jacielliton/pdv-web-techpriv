// backend/src/routes/index.js (VERSÃO CORRIGIDA)
const { Router } = require('express');

// Controllers
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const ProdutoController = require('../controllers/ProdutoController');
const VendaController = require('../controllers/VendaController');
const DashboardController = require('../controllers/DashboardController');
const PagSeguroController = require('../controllers/PagSeguroController'); 
const CaixaController = require('../controllers/CaixaController');
// Middlewares
const authMiddleware = require('../middlewares/auth');
const authManagerMiddleware = require('../middlewares/authManager');

const routes = new Router();

// --- Rota Pública de Health Check ---
routes.get('/status', (req, res) => res.json({ status: 'OK' }));

// --- Rota Pública de Login ---
routes.post('/login', SessionController.store);

// ===================================================================
// APLICA O MIDDLEWARE DE AUTENTICAÇÃO
routes.use(authMiddleware);
// ===================================================================

// --- Rotas para TODOS os funcionários logados (Caixas e Gerentes) ---
routes.get('/produtos', ProdutoController.index);
routes.post('/vendas', VendaController.store);

// --- ROTAS DE CAIXA MOVIDAS PARA A SEÇÃO CORRETA ---
routes.get('/caixa/status', CaixaController.getStatus);
routes.post('/caixa/abrir', CaixaController.abrirCaixa);
routes.post('/caixa/movimentacao', CaixaController.registrarMovimentacao);
routes.get('/caixa/resumo', CaixaController.getResumo);
routes.post('/caixa/fechar', CaixaController.fecharCaixa); // <--- MOVIDO PARA CIMA

// ===================================================================
// APLICA O MIDDLEWARE DE AUTORIZAÇÃO DE GERENTE
routes.use(authManagerMiddleware);
// ===================================================================

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
routes.get('/dashboard/vendas-semanais', DashboardController.getVendasSemanais);

// A rota de histórico de TODOS os caixas continua aqui, pois é uma função gerencial.
routes.get('/caixas/historico', CaixaController.getHistorico); 

// Rotas do PagSeguro
routes.post('/pagamento/pagseguro/order', PagSeguroController.createOrder);
routes.get('/pagamento/pagseguro/devices', PagSeguroController.listDevices);

module.exports = routes;