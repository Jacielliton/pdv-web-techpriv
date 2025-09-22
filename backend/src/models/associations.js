// backend/src/models/associations.js

const Funcionario = require('./Funcionario');
const Caixa = require('./Caixa');
const Venda = require('./Venda');
const VendaItem = require('./VendaItem');
const Produto = require('./Produto');
const Cliente = require('./Cliente');
const MovimentacaoCaixa = require('./MovimentacaoCaixa');

function applyAssociations() {
  // Relação: Funcionário -> Caixa (Um funcionário pode ter vários caixas)
  Funcionario.hasMany(Caixa, { foreignKey: 'funcionario_id' });
  Caixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

  // Relação: Funcionário -> Venda
  Funcionario.hasMany(Venda, { foreignKey: 'funcionario_id' });
  Venda.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });

  // Relação: Caixa -> Venda
  Caixa.hasMany(Venda, { foreignKey: 'caixa_id' });
  Venda.belongsTo(Caixa, { foreignKey: 'caixa_id' });

  // Relação: Cliente -> Venda
  Cliente.hasMany(Venda, { foreignKey: 'cliente_id' });
  Venda.belongsTo(Cliente, { foreignKey: 'cliente_id' });
  
  // Relação: Venda -> VendaItem
  Venda.hasMany(VendaItem, { foreignKey: 'venda_id' });
  VendaItem.belongsTo(Venda, { foreignKey: 'venda_id' });

  // Relação: Produto -> VendaItem
  Produto.hasMany(VendaItem, { foreignKey: 'produto_id' });
  VendaItem.belongsTo(Produto, { foreignKey: 'produto_id' });

  // Relação: Caixa -> MovimentacaoCaixa
  Caixa.hasMany(MovimentacaoCaixa, { foreignKey: 'caixa_id' });
  MovimentacaoCaixa.belongsTo(Caixa, { foreignKey: 'caixa_id' });

  // Relação: Funcionario -> MovimentacaoCaixa
  Funcionario.hasMany(MovimentacaoCaixa, { foreignKey: 'funcionario_id' });
  MovimentacaoCaixa.belongsTo(Funcionario, { foreignKey: 'funcionario_id' });
}

module.exports = applyAssociations;