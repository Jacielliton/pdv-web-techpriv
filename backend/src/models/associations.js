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

function applyAssociations() {
  // Relações de Funcionário
  Funcionario.hasMany(Caixa, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(Venda, { foreignKey: 'funcionario_id' });
  Funcionario.hasMany(MovimentacaoCaixa, { foreignKey: 'funcionario_id' });
  
  // Relações de Caixa
  Caixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Caixa.hasMany(Venda, { foreignKey: 'caixa_id' });
  Caixa.hasMany(MovimentacaoCaixa, { foreignKey: 'caixa_id' });

  // Relações de Venda
  Venda.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  Venda.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  Venda.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  Venda.hasMany(VendaItem, { foreignKey: 'venda_id' });

  // Relação de Cliente
  Cliente.hasMany(Venda, { foreignKey: 'cliente_id' });
  
  // Relação de VendaItem
  VendaItem.belongsTo(Venda, { foreignKey: 'venda_id' });
  VendaItem.belongsTo(Produto, { foreignKey: 'produto_id' });

  // Relação de Fornecedor
  Fornecedor.hasMany(EntradaEstoque, { foreignKey: 'fornecedor_id' });

  // ===================================================================
  // ASSOCIAÇÕES QUE FALTAVAM
  // ===================================================================
  Produto.hasMany(VendaItem, { foreignKey: 'produto_id' });
  Produto.hasMany(EntradaEstoque, { foreignKey: 'produto_id' });

  EntradaEstoque.belongsTo(Produto, { foreignKey: 'produto_id' });
  EntradaEstoque.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id' });
  EntradaEstoque.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
  // ===================================================================
  
  // Relação de MovimentacaoCaixa
  MovimentacaoCaixa.belongsTo(Caixa, { foreignKey: 'caixa_id' });
  MovimentacaoCaixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
}

module.exports = applyAssociations;