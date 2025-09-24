// backend/src/models/associations.js (VERSÃO FINAL E CORRIGIDA)
const Funcionario = require('./Funcionario');
const Caixa = require('./Caixa');
const Venda = require('./Venda');
const VendaItem = require('./VendaItem');
const Produto = require('./Produto');
const Cliente = require('./Cliente');
const MovimentacaoCaixa = require('./MovimentacaoCaixa');
const Fornecedor = require('./Fornecedor');
const EntradaEstoque = require('./EntradaEstoque');

// ===================================================================
// 1. IMPORTE OS NOVOS MODELS AQUI
// ===================================================================
const ContaReceber = require('./ContaReceber');
const PagamentoConta = require('./PagamentoConta');

function applyAssociations() {
  // Relações de Funcionário
  Funcionario.hasMany(Caixa, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(Venda, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(MovimentacaoCaixa, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(EntradaEstoque, { foreignKey: 'funcionario_id' });
  
  // Relações de Caixa
  Caixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Caixa.hasMany(Venda, { foreignKey: 'caixa_id' });
  Caixa.hasMany(MovimentacaoCaixa, { foreignKey: 'caixa_id' });

  // Relações de Venda
  Venda.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Venda.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  Venda.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  Venda.hasMany(VendaItem, { foreignKey: 'venda_id' });
  Venda.hasOne(ContaReceber, { foreignKey: 'venda_id' }); // Relação Venda -> Conta

  // Relação de Cliente
  Cliente.hasMany(Venda, { foreignKey: 'cliente_id' });
  Cliente.hasMany(ContaReceber, { foreignKey: 'cliente_id' });
  
  // Relação de VendaItem
  VendaItem.belongsTo(Venda, { foreignKey: 'venda_id' });
  VendaItem.belongsTo(Produto, { foreignKey: 'produto_id' });

  // Relação de Fornecedor
  Fornecedor.hasMany(EntradaEstoque, { foreignKey: 'fornecedor_id' });

  // Relação de Produto
  Produto.hasMany(VendaItem, { foreignKey: 'produto_id' });
  Produto.hasMany(EntradaEstoque, { foreignKey: 'produto_id' });

  // Relação de EntradaEstoque
  EntradaEstoque.belongsTo(Produto, { foreignKey: 'produto_id' });
  EntradaEstoque.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id' });
  EntradaEstoque.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  
  // Relação de MovimentacaoCaixa
  MovimentacaoCaixa.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  MovimentacaoCaixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

  // ===================================================================
  // 2. ASSOCIAÇÕES DE CONTAS A RECEBER E PAGAMENTOS
  // ===================================================================
  ContaReceber.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  ContaReceber.belongsTo(Venda, { foreignKey: 'venda_id' });
  ContaReceber.hasMany(PagamentoConta, { foreignKey: 'conta_id' });
  
  PagamentoConta.belongsTo(ContaReceber, { foreignKey: 'conta_id' });
  PagamentoConta.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  PagamentoConta.belongsTo(Caixa, { foreignKey: 'caixa_id' });
}

module.exports = applyAssociations;