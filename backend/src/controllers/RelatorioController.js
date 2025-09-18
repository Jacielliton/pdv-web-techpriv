// backend/src/controllers/RelatorioController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');

class RelatorioController {
  async getRelatorioVendas(req, res) {
    // Pega as datas da query string (ex: /vendas?data_inicio=2025-09-01&data_fim=2025-09-18)
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'As datas de início e fim são obrigatórias.' });
    }

    // Garante que o período final inclua o dia inteiro
    const dataFimAjustada = new Date(data_fim);
    dataFimAjustada.setHours(23, 59, 59, 999);

    try {
      const whereClause = {
        data_venda: {
          [Op.between]: [new Date(data_inicio), dataFimAjustada],
        },
      };

      // 1. Cálculo dos totais gerais
      const resumoGeral = await Venda.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'numeroDeVendas'],
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendido'],
        ],
        where: whereClause,
        raw: true,
      });

      // 2. Cálculo do total por método de pagamento
      const vendasPorMetodo = await Venda.findAll({
        attributes: [
          'metodo_pagamento',
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'total'],
        ],
        where: whereClause,
        group: ['metodo_pagamento'],
        raw: true,
      });
      
      // 3. Cálculo dos produtos mais vendidos no período
      const topProdutos = await VendaItem.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_vendido'],
        ],
        include: [{
          model: Produto,
          attributes: ['nome'],
        }, {
          model: Venda,
          attributes: [],
          where: whereClause, // Aplica o filtro de data na tabela de Vendas
        }],
        group: ['Produto.id'],
        order: [[sequelize.col('total_vendido'), 'DESC']],
        limit: 10,
        raw: true,
      });

      const relatorio = {
        periodo: {
          inicio: data_inicio,
          fim: data_fim,
        },
        resumo: {
          totalVendido: parseFloat(resumoGeral.totalVendido) || 0,
          numeroDeVendas: parseInt(resumoGeral.numeroDeVendas, 10) || 0,
          ticketMedio: resumoGeral.numeroDeVendas > 0 ? (resumoGeral.totalVendido / resumoGeral.numeroDeVendas) : 0,
        },
        vendasPorMetodo,
        topProdutos: topProdutos.map(p => ({
            nome: p['Produto.nome'],
            total_vendido: parseInt(p.total_vendido, 10),
        })),
      };

      return res.json(relatorio);
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas:", error);
      return res.status(500).json({ error: 'Erro ao gerar relatório.', details: error.message });
    }
  }
}

module.exports = new RelatorioController();