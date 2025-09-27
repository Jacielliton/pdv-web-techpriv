// backend/src/controllers/CaixaController.js (VERSÃO CORRIGIDA)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Caixa = require('../models/Caixa');
const Funcionario = require('../models/Funcionario');
const Venda = require('../models/Venda');
const MovimentacaoCaixa = require('../models/MovimentacaoCaixa');
const PagamentoConta = require('../models/PagamentoConta');


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
      
      const [vendasAgrupadas, movimentacoes, pagamentosAgrupados] = await Promise.all([
        Venda.findAll({ where: { caixa_id: caixaAberto.id }, attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']], group: ['metodo_pagamento'], raw: true }),
        MovimentacaoCaixa.findAll({ where: { caixa_id: caixaAberto.id }, attributes: ['tipo', [sequelize.fn('SUM', sequelize.col('valor')), 'total']], group: ['tipo'], raw: true }),
        PagamentoConta.findAll({ 
          where: { caixa_id: caixaAberto.id }, 
          attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor')), 'total']], 
          group: ['metodo_pagamento'], 
          raw: true 
        }),
      ]);

      const resumo = {
        caixa_id: caixaAberto.id,
        data_abertura: caixaAberto.data_abertura,
        valor_inicial: parseFloat(caixaAberto.valor_inicial),
        vendasPorMetodo: {},
        pagamentosDeContasPorMetodo: {},
        totalSangrias: 0,
        totalSuprimentos: 0,
      };

      vendasAgrupadas.forEach(venda => {
        // ============================ CORREÇÃO AQUI ============================
        // Usar 'vendasPorMetodo' ao invés de 'totaisPorPagamento'
        resumo.vendasPorMetodo[venda.metodo_pagamento] = parseFloat(venda.total);
        // =======================================================================
      });
      
      movimentacoes.forEach(mov => {
        if (mov.tipo === 'SANGRIA') resumo.totalSangrias = parseFloat(mov.total);
        if (mov.tipo === 'SUPRIMENTO') resumo.totalSuprimentos = parseFloat(mov.total);
      });

      pagamentosAgrupados.forEach(pagamento => {
        resumo.pagamentosDeContasPorMetodo[pagamento.metodo_pagamento] = parseFloat(pagamento.total);
      });
      
      return res.json(resumo);
    } catch (error) { return res.status(500).json({ error: 'Erro ao gerar resumo do caixa.', details: error.message }); }
  }

  // --- O restante do arquivo permanece o mesmo ---
  async fecharCaixa(req, res) {
    const { valor_final_informado } = req.body;
    const t = await sequelize.transaction();
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' }, transaction: t });
      if (!caixaAberto) {
        await t.rollback();
        return res.status(404).json({ error: 'Nenhum caixa aberto para fechar.' });
      }
      const totalVendasDinheiro = await Venda.sum('valor_total', { where: { caixa_id: caixaAberto.id, metodo_pagamento: 'Dinheiro' }, transaction: t }) || 0;
      const totalGeralVendas = await Venda.sum('valor_total', { where: { caixa_id: caixaAberto.id }, transaction: t }) || 0;
      const totalSuprimentos = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SUPRIMENTO' }, transaction: t }) || 0;
      const totalSangrias = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SANGRIA' }, transaction: t }) || 0;

      const totalPagamentosFiadoEmDinheiro = await PagamentoConta.sum('valor', {
        where: { caixa_id: caixaAberto.id, metodo_pagamento: 'Dinheiro' },
        transaction: t
      }) || 0;

      const valorEsperadoEmDinheiro = (
          parseFloat(caixaAberto.valor_inicial) + 
          totalVendasDinheiro + 
          totalSuprimentos + 
          totalPagamentosFiadoEmDinheiro
      ) - totalSangrias;
      
      const valorInformado = parseFloat(valor_final_informado);
      const diferenca = valorInformado - valorEsperadoEmDinheiro;
      
      const caixaFechado = await caixaAberto.update({
        data_fechamento: new Date(), 
        valor_final_calculado: totalGeralVendas,
        valor_final_informado: valorInformado, 
        diferenca: diferenca,
        status: 'FECHADO',
      }, { transaction: t });
      
      await t.commit();
      return res.json(caixaFechado);
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao fechar o caixa.', details: error.message });
    }
  }

  async getHistorico(req, res) {
    const { page = 1, limit = 10, dataInicio, dataFim, funcionarioId } = req.query;
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);

    const whereClause = { status: 'FECHADO' };
    if (funcionarioId) whereClause.funcionario_id = funcionarioId;
    if (dataInicio && dataFim) {
      const dataFimAjustada = new Date(dataFim);
      dataFimAjustada.setHours(23, 59, 59, 999);
      whereClause.data_fechamento = { [Op.between]: [new Date(dataInicio), dataFimAjustada] };
    }

    try {
      const { count, rows } = await Caixa.findAndCountAll({
        where: whereClause,
        order: [['data_fechamento', 'DESC']],
        include: [{ model: Funcionario, attributes: ['nome'] }],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });

      const historicoCaixas = JSON.parse(JSON.stringify(rows));
      const caixaIds = historicoCaixas.map(c => c.id);

      const vendasAgrupadas = await Venda.findAll({
        where: { caixa_id: { [Op.in]: caixaIds } },
        attributes: [
          'caixa_id',
          'metodo_pagamento',
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']
        ],
        group: ['caixa_id', 'metodo_pagamento'],
        raw: true,
      });

      historicoCaixas.forEach(caixa => {
        caixa.totaisPorPagamento = {};
        const vendasDoCaixa = vendasAgrupadas.filter(v => v.caixa_id === caixa.id);
        vendasDoCaixa.forEach(venda => {
          caixa.totaisPorPagamento[venda.metodo_pagamento] = parseFloat(venda.total);
        });
      });

      const totalPages = Math.ceil(count / parseInt(limit, 10));
      return res.json({ historico: historicoCaixas, totalPages, currentPage: parseInt(page, 10) });
    } catch (error) {
      console.error("Erro ao buscar histórico de caixas:", error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de caixas.', details: error.message });
    }
  }
  
  async getDetalhesCaixa(req, res) {
    const { id } = req.params;
    try {
      const caixa = await Caixa.findByPk(id, {
        include: [{ model: Funcionario, attributes: ['nome'] }]
      });
      if (!caixa) {
        return res.status(404).json({ error: 'Caixa não encontrado.' });
      }

      const [vendas, movimentacoes, pagamentosDeContas] = await Promise.all([
        Venda.findAll({
          where: { caixa_id: id },
          attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']],
          group: ['metodo_pagamento'],
          raw: true,
        }),
        MovimentacaoCaixa.findAll({
          where: { caixa_id: id },
          attributes: ['tipo', [sequelize.fn('SUM', sequelize.col('valor')), 'total']],
          group: ['tipo'],
          raw: true,
        }),
        // ESTA PARTE É ESSENCIAL
        PagamentoConta.findAll({
          where: { caixa_id: id },
          attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor')), 'total']],
          group: ['metodo_pagamento'],
          raw: true,
        }),
      ]);

      const detalhes = {
        caixa: caixa.toJSON(),
        vendasPorMetodo: {},
        pagamentosDeContasPorMetodo: {}, // Objeto deve ser inicializado
        movimentacoes: { SANGRIA: 0, SUPRIMENTO: 0 }
      };

      vendas.forEach(v => { detalhes.vendasPorMetodo[v.metodo_pagamento] = parseFloat(v.total); });
      movimentacoes.forEach(m => { detalhes.movimentacoes[m.tipo] = parseFloat(m.total); });
      
      // E ESTA TAMBÉM É ESSENCIAL
      pagamentosDeContas.forEach(p => { 
        detalhes.pagamentosDeContasPorMetodo[p.metodo_pagamento] = parseFloat(p.total); 
      });

      return res.json(detalhes);
    } catch (error) {
      console.error("Erro ao buscar detalhes do caixa:", error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do caixa.', details: error.message });
    }
}

  async getMovimentacoes(req, res) {
    const { page = 1, limit = 15, dataInicio, dataFim, tipo } = req.query;
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);
    const whereClause = {};
    if (tipo) whereClause.tipo = tipo;
    if (dataInicio && dataFim) {
      const dataFimAjustada = new Date(dataFim);
      dataFimAjustada.setHours(23, 59, 59, 999);
      whereClause.data_movimentacao = { [Op.between]: [new Date(dataInicio), dataFimAjustada] };
    }
    try {
      const { count, rows: movimentacoes } = await MovimentacaoCaixa.findAndCountAll({
        where: whereClause,
        order: [['data_movimentacao', 'DESC']],
        include: [{ model: Funcionario, attributes: ['nome'] }],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });
      const totalPages = Math.ceil(count / parseInt(limit, 10));
      return res.json({ movimentacoes, totalPages, currentPage: parseInt(page, 10) });
    } catch (error) {
      console.error("Erro ao buscar histórico de movimentações:", error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de movimentações.' });
    }
  }
}

module.exports = new CaixaController();