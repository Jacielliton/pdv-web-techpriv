// backend/src/controllers/CaixaController.js (VERSÃO LIMPA E FINAL)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Caixa = require('../models/Caixa');
const Funcionario = require('../models/Funcionario');
const Venda = require('../models/Venda');
const MovimentacaoCaixa = require('../models/MovimentacaoCaixa');

class CaixaController {
  async getStatus(req, res) {
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' } });
      if (caixaAberto) { return res.json({ status: 'ABERTO', caixa: caixaAberto }); }
      else { return res.json({ status: 'FECHADO' }); }
    } catch (error) { return res.status(500).json({ error: 'Erro ao verificar status do caixa.', details: error.message }); }
  }

  async abrirCaixa(req, res) {
    const { valor_inicial } = req.body;
    if (valor_inicial === undefined || isNaN(parseFloat(valor_inicial))) {
      return res.status(400).json({ error: 'Valor inicial é obrigatório e deve ser um número.' });
    }
    try {
      const caixaJaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' } });
      if (caixaJaAberto) { return res.status(400).json({ error: 'Já existe um caixa aberto para este funcionário.' }); }
      const novoCaixa = await Caixa.create({ valor_inicial: parseFloat(valor_inicial), funcionario_id: req.userId, status: 'ABERTO' });
      return res.status(201).json(novoCaixa);
    } catch (error) { return res.status(500).json({ error: 'Erro ao abrir o caixa.', details: error.message }); }
  }
  
  async registrarMovimentacao(req, res) {
    const { tipo, valor, observacao } = req.body;
    const funcionario_id = req.userId;
    if (!['SANGRIA', 'SUPRIMENTO'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de movimentação inválido.' });
    }
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'Valor inválido.' });
    }
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id, status: 'ABERTO' } });
      if (!caixaAberto) {
        return res.status(400).json({ error: 'Nenhum caixa aberto para registrar a movimentação.' });
      }
      const movimentacao = await MovimentacaoCaixa.create({ tipo, valor: parseFloat(valor), observacao, caixa_id: caixaAberto.id, funcionario_id });
      return res.status(201).json(movimentacao);
    } catch (error) { return res.status(500).json({ error: 'Erro ao registrar movimentação.', details: error.message }); }
  }

  async getResumo(req, res) {
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' } });
      if (!caixaAberto) { return res.status(404).json({ error: 'Nenhum caixa aberto encontrado.' }); }
      const vendas = await Venda.findAll({ where: { caixa_id: caixaAberto.id }, attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']], group: ['metodo_pagamento'], raw: true });
      const movimentacoes = await MovimentacaoCaixa.findAll({ where: { caixa_id: caixaAberto.id }, attributes: ['tipo', [sequelize.fn('SUM', sequelize.col('valor')), 'total']], group: ['tipo'], raw: true });
      const resumo = {
        caixa_id: caixaAberto.id, data_abertura: caixaAberto.data_abertura,
        valor_inicial: parseFloat(caixaAberto.valor_inicial), totaisPorPagamento: {},
        totalSangrias: 0, totalSuprimentos: 0,
      };
      vendas.forEach(venda => { resumo.totaisPorPagamento[venda.metodo_pagamento] = parseFloat(venda.total); });
      movimentacoes.forEach(mov => {
        if (mov.tipo === 'SANGRIA') resumo.totalSangrias = parseFloat(mov.total);
        if (mov.tipo === 'SUPRIMENTO') resumo.totalSuprimentos = parseFloat(mov.total);
      });
      return res.json(resumo);
    } catch (error) { return res.status(500).json({ error: 'Erro ao gerar resumo do caixa.', details: error.message }); }
  }

  async fecharCaixa(req, res) {
    const { valor_final_informado } = req.body;
    if (valor_final_informado === undefined || isNaN(parseFloat(valor_final_informado))) {
      return res.status(400).json({ error: 'Valor final informado é obrigatório.' });
    }
    const t = await sequelize.transaction();
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' }, transaction: t });
      if (!caixaAberto) {
        await t.rollback();
        return res.status(404).json({ error: 'Nenhum caixa aberto para fechar.' });
      }
      const totalVendasDinheiro = await Venda.sum('valor_total', { where: { caixa_id: caixaAberto.id, metodo_pagamento: 'Dinheiro' }, transaction: t }) || 0;
      const totalSuprimentos = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SUPRIMENTO' }, transaction: t }) || 0;
      const totalSangrias = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SANGRIA' }, transaction: t }) || 0;
      const valorCalculado = (parseFloat(caixaAberto.valor_inicial) + totalVendasDinheiro + totalSuprimentos) - totalSangrias;
      const valorInformado = parseFloat(valor_final_informado);
      const diferenca = valorInformado - valorCalculado;
      const caixaFechado = await caixaAberto.update({
        data_fechamento: new Date(), valor_final_calculado: valorCalculado,
        valor_final_informado: valorInformado, diferenca: diferenca, status: 'FECHADO',
      }, { transaction: t });
      await t.commit();
      return res.json(caixaFechado);
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao fechar o caixa.', details: error.message });
    }
  }

  async getHistorico(req, res) {
    const { page = 1 } = req.query;
    const limit = 10;
    const offset = limit * (page - 1);

    try {
      const { count, rows: historico } = await Caixa.findAndCountAll({
        where: { status: 'FECHADO' },
        order: [['data_fechamento', 'DESC']],
        include: [{ model: Funcionario, attributes: ['nome'] }],
        limit,
        offset,
      });
      
      const totalPages = Math.ceil(count / limit);
      return res.json({ historico, totalPages, currentPage: parseInt(page, 10) });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar histórico de caixas.', details: error.message });
    }
  }
}

module.exports = new CaixaController();