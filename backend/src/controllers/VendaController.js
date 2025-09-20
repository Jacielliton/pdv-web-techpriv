// pdv-web-techpriv\backend\src\controllers\VendaController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');
const Funcionario = require('../models/Funcionario');
const Caixa = require('../models/Caixa');

class VendaController {

  // Listar todas as vendas com detalhes
  async index(req, res) {
    const { page = 1, limit = 10, dataInicio, dataFim, metodoPagamento, vendaId } = req.query;
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);

    // --- LÓGICA DE FILTRO DINÂMICO ---
    const whereClause = {};

    if (vendaId) {
      whereClause.id = vendaId;
    }
    if (dataInicio && dataFim) {
      const dataFimAjustada = new Date(dataFim);
      dataFimAjustada.setHours(23, 59, 59, 999);
      whereClause.data_venda = { [Op.between]: [new Date(dataInicio), dataFimAjustada] };
    }
    if (metodoPagamento) {
      whereClause.metodo_pagamento = metodoPagamento;
    }
    // --- FIM DA LÓGICA DE FILTRO ---

    try {
      const { count, rows: vendas } = await Venda.findAndCountAll({
        where: whereClause, // Usa a cláusula de filtro construída
        order: [['data_venda', 'DESC']],
        include: [
          { model: Funcionario, attributes: ['nome'] },
          {
            model: VendaItem,
            attributes: ['quantidade', 'preco_unitario'],
            include: [{ model: Produto, attributes: ['nome'] }],
          },
        ],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / parseInt(limit, 10));
      return res.json({ vendas, totalPages, currentPage: parseInt(page, 10) });
    } catch (error) {
      console.error("Erro ao buscar histórico de vendas:", error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de vendas.', details: error.message });
    }
  }
  
  // Cadastrar uma nova venda
  async store(req, res) {
    const t = await sequelize.transaction();
    try {
      const { valor_total, metodo_pagamento, itens } = req.body;
      const funcionario_id = req.userId;

      const caixaAberto = await Caixa.findOne({ where: { funcionario_id, status: 'ABERTO' }, transaction: t });
      if (!caixaAberto) {
        await t.rollback();
        return res.status(400).json({ error: 'Nenhum caixa aberto para este funcionário.' });
      }

      const novaVenda = await Venda.create({
        funcionario_id, valor_total, metodo_pagamento, caixa_id: caixaAberto.id,
      }, { transaction: t });

      const itensDaVenda = itens.map(item => ({
        venda_id: novaVenda.id, produto_id: item.id,
        quantidade: item.quantidade, preco_unitario: item.preco,
      }));
      await VendaItem.bulkCreate(itensDaVenda, { transaction: t });

      for (const item of itens) {
        const produto = await Produto.findByPk(item.id, { transaction: t });
        if (!produto || produto.quantidade_estoque < item.quantidade) {
          await t.rollback();
          return res.status(400).json({ error: `Estoque insuficiente para o produto: ${item.nome}` });
        }
        produto.quantidade_estoque -= item.quantidade;
        await produto.save({ transaction: t });
      }

      await t.commit();
      
      // --- ALTERAÇÃO PRINCIPAL AQUI ---
      // Após o sucesso, buscamos a venda completa com todos os detalhes para retornar ao frontend
      const vendaCompleta = await Venda.findByPk(novaVenda.id, {
        include: [
          { model: Funcionario, attributes: ['nome'] },
          { model: VendaItem, include: [{ model: Produto, attributes: ['nome'] }] }
        ]
      });

      return res.status(201).json(vendaCompleta); // Retorna o objeto completo da venda

    } catch (error) {
      await t.rollback();
      console.error("Erro ao registrar venda:", error);
      return res.status(500).json({ error: 'Falha ao registrar a venda.', details: error.message });
    }
  }


}

module.exports = new VendaController();