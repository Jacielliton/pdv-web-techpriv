// backend/src/controllers/EstoqueController.js
const sequelize = require('../config/database');
const EntradaEstoque = require('../models/EntradaEstoque');
const Produto = require('../models/Produto');

class EstoqueController {
  async registrarEntrada(req, res) {
    const { produto_id, quantidade, preco_custo_unitario, fornecedor_id } = req.body;
    const funcionario_id = req.userId;

    const t = await sequelize.transaction();
    try {
      // 1. Encontrar o produto
      const produto = await Produto.findByPk(produto_id, { transaction: t });
      if (!produto) {
        await t.rollback();
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // 2. Atualizar a quantidade em estoque e o preço de custo do produto
      produto.quantidade_estoque += quantidade;
      produto.preco_custo = preco_custo_unitario;
      await produto.save({ transaction: t });

      // 3. Criar o registro histórico da entrada
      await EntradaEstoque.create({
        produto_id,
        quantidade,
        preco_custo_unitario,
        fornecedor_id,
        funcionario_id
      }, { transaction: t });
      
      await t.commit();
      return res.status(201).json({ message: 'Entrada de estoque registrada com sucesso!' });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao registrar entrada de estoque.', details: error.message });
    }
  }
}

module.exports = new EstoqueController();