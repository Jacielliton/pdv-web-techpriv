'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('carrinhos_salvos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      conteudo: {
        type: Sequelize.JSON,
        allowNull: false
      },
      desconto: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      funcionario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'funcionarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vendedor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'funcionarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('carrinhos_salvos');
  }
};