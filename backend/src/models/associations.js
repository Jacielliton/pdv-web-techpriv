// backend/src/models/associations.js (VERSÃO CORRIGIDA COM IMPORTS)
const Funcionario = require('./Funcionario');
const Caixa = require('./Caixa');
const Venda = require('./Venda');
const VendaItem = require('./VendaItem');
const Produto = require('./Produto');
const Cliente = require('./Cliente');
const MovimentacaoCaixa = require('./MovimentacaoCaixa');
const Fornecedor = require('./Fornecedor');
const EntradaEstoque = require('./EntradaEstoque');
const ContaReceber = require('./ContaReceber');
const PagamentoConta = require('./PagamentoConta');
const CarrinhoSalvo = require('./CarrinhoSalvo');

// ===================================================================
// CORREÇÃO: ADICIONE OS IMPORTS PARA OS NOVOS MODELS AQUI
// ===================================================================
const Grupo = require('./Grupo');
const Categoria = require('./Categoria');
// ===================================================================

function applyAssociations() {
  // Relações de Funcionário
  Funcionario.hasMany(Caixa, { foreignKey: 'funcionario_id' });
  Funcionario.hasOne(CarrinhoSalvo, { foreignKey: 'funcionario_id', onDelete: 'CASCADE' });
  Funcionario.hasMany(Venda, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(MovimentacaoCaixa, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(EntradaEstoque, { foreignKey: 'funcionario_id' });
  
  // Relações de Caixa
  Caixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Caixa.hasMany(Venda, { foreignKey: 'caixa_id' });
  Caixa.hasMany(MovimentacaoCaixa, { foreignKey: 'caixa_id' });

  // Relações de Venda
  Venda.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Venda.belongsTo(Funcionario, { 
    foreignKey: 'vendedor_id', 
    as: 'Vendedor'
  });
  Venda.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  Venda.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  Venda.hasMany(VendaItem, { foreignKey: 'venda_id' });
  Venda.hasOne(ContaReceber, { foreignKey: 'venda_id' });

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
  // Novas associações de Produto
  Produto.belongsTo(Grupo, { foreignKey: 'grupo_id' });
  Produto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

  // Novas associações para Grupo e Categoria
  Grupo.hasMany(Produto, { foreignKey: 'grupo_id' });
  Categoria.hasMany(Produto, { foreignKey: 'categoria_id' });

  // Relação de EntradaEstoque
  EntradaEstoque.belongsTo(Produto, { foreignKey: 'produto_id' });
  EntradaEstoque.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id' });
  EntradaEstoque.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  
  // Relação de MovimentacaoCaixa
  MovimentacaoCaixa.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  MovimentacaoCaixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

  // Associações de Contas a Receber e Pagamentos
  ContaReceber.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  ContaReceber.belongsTo(Venda, { foreignKey: 'venda_id' });
  ContaReceber.hasMany(PagamentoConta, { foreignKey: 'conta_id' });
  
  PagamentoConta.belongsTo(ContaReceber, { foreignKey: 'conta_id' });
  PagamentoConta.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  PagamentoConta.belongsTo(Caixa, { foreignKey: 'caixa_id' });

  // Associações do Carrinho Salvo
  CarrinhoSalvo.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  CarrinhoSalvo.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  CarrinhoSalvo.belongsTo(Funcionario, { as: 'Vendedor', foreignKey: 'vendedor_id' });
}

module.exports = applyAssociations;