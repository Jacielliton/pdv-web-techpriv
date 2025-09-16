const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class VendaItem extends Model {}

VendaItem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  venda_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'vendas', // <--- CORRIGIDO
      key: 'id',
    },
    allowNull: false,
  },
  produto_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'produtos', // <--- CORRIGIDO
      key: 'id',
    },
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  preco_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'VendaItem',
  tableName: 'venda_itens',
  timestamps: false,
});

module.exports = VendaItem;