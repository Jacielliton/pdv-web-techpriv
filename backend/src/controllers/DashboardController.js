const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');

class DashboardController {
  // Método para buscar os dados resumidos do dashboard
  async getSummary(req, res) {
    try {
      // --- 1. Calcular Vendas do Dia ---
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Define a hora para o início do dia

      const dadosVendasHoje = await Venda.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendidoHoje'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'numeroDeVendasHoje'],
        ],
        where: {
          data_venda: {
            [Op.gte]: hoje, // Op.gte significa "maior ou igual a" (greater than or equal)
          },
        },
        raw: true, // Retorna um objeto JSON simples
      });

      // --- 2. Calcular Produtos Mais Vendidos (Top 5) ---
      const produtosMaisVendidos = await VendaItem.findAll({
        attributes: [
          'produto_id',
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_vendido'],
        ],
        include: [{
          model: Produto,
          attributes: ['nome'], // Pega o nome do produto
        }],
        group: ['produto_id', 'Produto.id'], // Agrupa pela ID do produto
        order: [[sequelize.col('total_vendido'), 'DESC']], // Ordena pelo total vendido
        limit: 5, // Limita aos 5 primeiros
        raw: true, // Retorna um objeto JSON simples
      });

      // Formata os dados para facilitar o uso no frontend
      const topProdutos = produtosMaisVendidos.map(p => ({
        nome: p['Produto.nome'],
        total_vendido: p.total_vendido,
      }));

      const resumo = {
        totalVendidoHoje: parseFloat(dadosVendasHoje.totalVendidoHoje) || 0,
        numeroDeVendasHoje: parseInt(dadosVendasHoje.numeroDeVendasHoje, 10) || 0,
        topProdutos: topProdutos,
      };

      return res.json(resumo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados do dashboard.', details: error.message });
    }
  }
}

module.exports = new DashboardController();