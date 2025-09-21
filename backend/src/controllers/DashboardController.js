// pdv-web-techpriv\backend\src\controllers\DashboardController.js (VERSÃO CORRIGIDA)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');

class DashboardController {
  async getSummary(req, res) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dadosVendasHoje = await Venda.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'totalVendidoHoje'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'numeroDeVendasHoje'],
        ],
        where: {
          data_venda: {
            [Op.gte]: hoje,
          },
        },
        raw: true,
      });

      const produtosMaisVendidos = await VendaItem.findAll({
        attributes: [
          'produto_id',
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'total_vendido'],
        ],
        include: [{
          model: Produto,
          attributes: ['nome'],
        }],
        group: ['produto_id', 'Produto.id'],
        order: [[sequelize.col('total_vendido'), 'DESC']],
        limit: 5,
        raw: true,
      });

      const topProdutos = produtosMaisVendidos.map(p => ({
        nome: p['Produto.nome'],
        total_vendido: p.total_vendido,
      }));

      // --- CÁLCULO DO TICKET MÉDIO ADICIONADO AQUI ---
      const totalVendido = parseFloat(dadosVendasHoje.totalVendidoHoje) || 0;
      const numeroDeVendas = parseInt(dadosVendasHoje.numeroDeVendasHoje, 10) || 0;
      const ticketMedioHoje = numeroDeVendas > 0 ? totalVendido / numeroDeVendas : 0;
      // ------------------------------------------------

      const resumo = {
        totalVendidoHoje: totalVendido,
        numeroDeVendasHoje: numeroDeVendas,
        ticketMedioHoje: ticketMedioHoje, // <-- NOVO CAMPO ADICIONADO À RESPOSTA
        topProdutos: topProdutos,
      };

      return res.json(resumo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados do dashboard.', details: error.message });
    }
  }

  // A função getVendasSemanais permanece a mesma
  async getVendasSemanais(req, res) {
    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
      seteDiasAtras.setHours(0, 0, 0, 0);

      const vendasPorDia = await Venda.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('data_venda')), 'dia'],
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'total'],
        ],
        where: {
          data_venda: {
            [Op.gte]: seteDiasAtras,
          },
        },
        group: [sequelize.fn('DATE', sequelize.col('data_venda'))],
        order: [[sequelize.fn('DATE', sequelize.col('data_venda')), 'ASC']],
        raw: true,
      });

      const dadosGrafico = [];
      const mapaVendas = new Map(vendasPorDia.map(v => [new Date(v.dia).toISOString().split('T')[0], parseFloat(v.total)]));

      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const diaFormatado = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const chaveData = data.toISOString().split('T')[0];
        
        dadosGrafico.push({
          data: diaFormatado,
          total: mapaVendas.get(chaveData) || 0,
        });
      }
      
      return res.json(dadosGrafico);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados para o gráfico.', details: error.message });
    }
  }
}

module.exports = new DashboardController();