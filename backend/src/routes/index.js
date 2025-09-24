// backend/src/routes/index.js (VERSÃO CORRIGIDA)
const { Router } = require('express');

// Controllers
const FuncionarioController = require('../controllers/FuncionarioController');
const SessionController = require('../controllers/SessionController');
const ProdutoController = require('../controllers/ProdutoController');
const VendaController = require('../controllers/VendaController');
const DashboardController = require('../controllers/DashboardController');
const CaixaController = require('../controllers/CaixaController');
const RelatorioController = require('../controllers/RelatorioController');
const ClienteController = require('../controllers/ClienteController');
const FornecedorController = require('../controllers/FornecedorController');
const EstoqueController = require('../controllers/EstoqueController');
const ContasReceberController = require('../controllers/ContasReceberController');

// Middlewares
const authMiddleware = require('../middlewares/auth');
const authManagerMiddleware = require('../middlewares/authManager');


const routes = new Router();

// --- Rotas Públicas ---
routes.get('/status', (req, res) => res.json({ status: 'OK' }));
routes.post('/login', SessionController.store);

// ===================================================================
// APLICA O MIDDLEWARE DE AUTENTICAÇÃO
routes.use(authMiddleware);
// ===================================================================

// --- Rotas para TODOS os funcionários logados (Caixas e Gerentes) ---
routes.get('/produtos', ProdutoController.index);
routes.post('/vendas', VendaController.store);
routes.get('/vendas/:id', VendaController.show);
routes.put('/vendas/:id/cancelar', VendaController.cancelar);
routes.get('/vendas', VendaController.index);

routes.get('/caixa/status', CaixaController.getStatus);
routes.post('/caixa/abrir', CaixaController.abrirCaixa);
routes.post('/caixa/movimentacao', CaixaController.registrarMovimentacao);
routes.get('/caixa/resumo', CaixaController.getResumo);
routes.post('/caixa/fechar', CaixaController.fecharCaixa);
routes.get('/clientes/:clienteId/contas', ContasReceberController.index);
routes.post('/contas-receber/:contaId/pagar', ContasReceberController.registrarPagamento);

// ===================================================================
// ROTA DE LISTAGEM DE CLIENTES MOVIDA PARA CIMA
// Agora, todos os usuários logados podem buscar/listar clientes.
routes.get('/clientes', ClienteController.index);
// ===================================================================

// ===================================================================
// NOVAS ROTAS LIBERADAS PARA O CAIXA
// ===================================================================
routes.post('/clientes', ClienteController.store); // Permite CADASTRAR cliente
routes.post('/contas-receber/:contaId/pagar', ContasReceberController.registrarPagamento);
// ===================================================================


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
routes.get('/produtos/:id/detalhes', ProdutoController.getDetalhes);

routes.get('/dashboard/summary', DashboardController.getSummary);
routes.get('/dashboard/vendas-semanais', DashboardController.getVendasSemanais);
routes.get('/dashboard/low-stock', DashboardController.getLowStockProducts);

routes.get('/caixas/historico', CaixaController.getHistorico);
routes.get('/caixas/movimentacoes', CaixaController.getMovimentacoes);
routes.get('/relatorios/vendas', RelatorioController.getRelatorioVendas);
routes.get('/relatorios/lucratividade', RelatorioController.getRelatorioLucratividade);

// ROTAS DE GERENCIAMENTO DE CLIENTES (permanecem exclusivas para gerentes)
routes.get('/clientes/:id', ClienteController.show);
routes.put('/clientes/:id', ClienteController.update);   // EDITAR continua sendo apenas para gerente
routes.delete('/clientes/:id', ClienteController.destroy); // DELETAR continua sendo apenas para gerente

// ROTAS DE FORNECEDORES E ESTOQUE
routes.get('/fornecedores', FornecedorController.index);
routes.post('/fornecedores', FornecedorController.store);
routes.put('/fornecedores/:id', FornecedorController.update);
routes.delete('/fornecedores/:id', FornecedorController.delete);
routes.post('/estoque/entrada', EstoqueController.registrarEntrada);


module.exports = routes;