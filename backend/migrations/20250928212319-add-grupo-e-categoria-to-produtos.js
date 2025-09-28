'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona a coluna 'grupo_id'
    await queryInterface.addColumn('produtos', 'grupo_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'grupos', // Nome da tabela de referência
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Se um grupo for deletado, o campo no produto se torna nulo
    });

    // Adiciona a coluna 'categoria_id'
    await queryInterface.addColumn('produtos', 'categoria_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'categorias', // Nome da tabela de referência
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Se uma categoria for deletada, o campo no produto se torna nulo
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove a coluna 'categoria_id'
    await queryInterface.removeColumn('produtos', 'categoria_id');
    // Remove a coluna 'grupo_id'
    await queryInterface.removeColumn('produtos', 'grupo_id');
  }
};