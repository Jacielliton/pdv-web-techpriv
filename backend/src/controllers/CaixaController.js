const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Caixa = require('../models/Caixa');
const Venda = require('../models/Venda');
const MovimentacaoCaixa = require('../models/MovimentacaoCaixa');

class CaixaController {
  // --- VERIFICA SE HÁ UM CAIXA ABERTO PARA O USUÁRIO LOGADO ---
  async getStatus(req, res) {
    try {
      const caixaAberto = await Caixa.findOne({
        where: {
          funcionario_id: req.userId,
          status: 'ABERTO',
        },
      });

      if (caixaAberto) {
        return res.json({ status: 'ABERTO', caixa: caixaAberto });
      } else {
        return res.json({ status: 'FECHADO' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar status do caixa.', details: error.message });
    }
  }

  // --- ABRE UM NOVO CAIXA ---
  async abrirCaixa(req, res) {
    const { valor_inicial } = req.body;

    if (valor_inicial === undefined || isNaN(parseFloat(valor_inicial))) {
      return res.status(400).json({ error: 'Valor inicial é obrigatório e deve ser um número.' });
    }

    try {
      const caixaJaAberto = await Caixa.findOne({
        where: { funcionario_id: req.userId, status: 'ABERTO' },
      });

      if (caixaJaAberto) {
            return res.status(400).json({ error: 'Já existe um caixa aberto para este funcionário.' });
            }

      const novoCaixa = await Caixa.create({
        valor_inicial: parseFloat(valor_inicial),
        funcionario_id: req.userId,
        status: 'ABERTO',
      });

      return res.status(201).json(novoCaixa);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao abrir o caixa.', details: error.message });
    }
  }

  // --- GERA O RESUMO DO CAIXA ABERTO ATUAL ---
  async getResumo(req, res) {
    try {
      const caixaAberto = await Caixa.findOne({
        where: { funcionario_id: req.userId, status: 'ABERTO' },
      });

      if (!caixaAberto) {
        return res.status(404).json({ error: 'Nenhum caixa aberto encontrado para este funcionário.' });
      }

      const vendas = await Venda.findAll({
        where: { caixa_id: caixaAberto.id },
        attributes: [
          'metodo_pagamento',
          [sequelize.fn('SUM', sequelize.col('valor_total')), 'total'],
        ],
        group: ['metodo_pagamento'],
        raw: true,
      });

      const resumo = {
        caixa_id: caixaAberto.id,
        data_abertura: caixaAberto.data_abertura,
        valor_inicial: parseFloat(caixaAberto.valor_inicial),
        totaisPorPagamento: {},
      };

      let totalVendas = 0;
      vendas.forEach(venda => {
        resumo.totaisPorPagamento[venda.metodo_pagamento] = parseFloat(venda.total);
        totalVendas += parseFloat(venda.total);
      });
      
      resumo.totalVendas = totalVendas;
      resumo.totalCalculado = resumo.valor_inicial + totalVendas;

      return res.json(resumo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao gerar resumo do caixa.', details: error.message });
    }
  }

  // --- FECHA O CAIXA ABERTO ATUAL ---
  async fecharCaixa(req, res) {
    const { valor_final_informado } = req.body;

    if (valor_final_informado === undefined || isNaN(parseFloat(valor_final_informado))) {
      return res.status(400).json({ error: 'Valor final informado é obrigatório.' });
    }

    try {
      const caixaAberto = await Caixa.findOne({
        where: { funcionario_id: req.userId, status: 'ABERTO' },
      });

      if (!caixaAberto) {
        return res.status(404).json({ error: 'Nenhum caixa aberto para fechar.' });
      }

      // Calcula o total de vendas para este caixa
      const totalVendas = await Venda.sum('valor_total', {
        where: { caixa_id: caixaAberto.id }
      });

      const valorCalculado = parseFloat(caixaAberto.valor_inicial) + (totalVendas || 0);
      const valorInformado = parseFloat(valor_final_informado);
      const diferenca = valorInformado - valorCalculado;

      // Atualiza o registro do caixa no banco
      const caixaFechado = await caixaAberto.update({
        data_fechamento: new Date(),
        valor_final_calculado: valorCalculado,
        valor_final_informado: valorInformado,
        diferenca: diferenca,
        status: 'FECHADO',
      });

      return res.json(caixaFechado);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao fechar o caixa.', details: error.message });
    }
  }

   async registrarMovimentacao(req, res) {
    const { tipo, valor, observacao } = req.body;
    const funcionario_id = req.userId;

    // Validações básicas
    if (!['SANGRIA', 'SUPRIMENTO'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de movimentação inválido. Use SANGRIA ou SUPRIMENTO.' });
    }
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'O valor da movimentação deve ser um número positivo.' });
    }

    try {
      // Encontra o caixa que está atualmente aberto para o funcionário logado
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id, status: 'ABERTO' } });

      if (!caixaAberto) {
        return res.status(400).json({ error: 'Nenhum caixa aberto para registrar a movimentação. Por favor, inicie uma nova sessão.' });
      }

      // Cria o registro da movimentação no banco de dados
      const movimentacao = await MovimentacaoCaixa.create({
        tipo,
        valor: parseFloat(valor),
        observacao,
        caixa_id: caixaAberto.id,
        funcionario_id,
      });

      return res.status(201).json(movimentacao);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar movimentação no caixa.', details: error.message });
    }
  }

  // --- GERA O RESUMO DO CAIXA ABERTO ATUAL (LÓGICA ATUALIZADA) ---
  async getResumo(req, res) {
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' } });
      if (!caixaAberto) {
        return res.status(404).json({ error: 'Nenhum caixa aberto encontrado para este funcionário.' });
      }

      // 1. Busca totais de vendas (código existente)
      const vendas = await Venda.findAll({
        where: { caixa_id: caixaAberto.id },
        attributes: ['metodo_pagamento', [sequelize.fn('SUM', sequelize.col('valor_total')), 'total']],
        group: ['metodo_pagamento'],
        raw: true,
      });

      // 2. ADICIONADO: Busca totais de sangrias e suprimentos
      const movimentacoes = await MovimentacaoCaixa.findAll({
        where: { caixa_id: caixaAberto.id },
        attributes: ['tipo', [sequelize.fn('SUM', sequelize.col('valor')), 'total']],
        group: ['tipo'],
        raw: true,
      });

      // 3. Organiza todos os dados para enviar ao frontend
      const resumo = {
        caixa_id: caixaAberto.id,
        data_abertura: caixaAberto.data_abertura,
        valor_inicial: parseFloat(caixaAberto.valor_inicial),
        totaisPorPagamento: {},
        totalSangrias: 0,
        totalSuprimentos: 0,
      };

      vendas.forEach(venda => { resumo.totaisPorPagamento[venda.metodo_pagamento] = parseFloat(venda.total); });
      
      // ADICIONADO: Processa os resultados das movimentações
      movimentacoes.forEach(mov => {
        if (mov.tipo === 'SANGRIA') resumo.totalSangrias = parseFloat(mov.total);
        if (mov.tipo === 'SUPRIMENTO') resumo.totalSuprimentos = parseFloat(mov.total);
      });

      return res.json(resumo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao gerar resumo do caixa.', details: error.message });
    }
  }


  // --- FECHA O CAIXA ABERTO ATUAL (LÓGICA ATUALIZADA) ---
  async fecharCaixa(req, res) {
    const { valor_final_informado } = req.body;
    if (valor_final_informado === undefined || isNaN(parseFloat(valor_final_informado))) {
      return res.status(400).json({ error: 'Valor final informado é obrigatório.' });
    }

    const t = await sequelize.transaction(); // Usar transação para garantir a integridade
    try {
      const caixaAberto = await Caixa.findOne({ where: { funcionario_id: req.userId, status: 'ABERTO' }, transaction: t });
      if (!caixaAberto) {
        await t.rollback();
        return res.status(404).json({ error: 'Nenhum caixa aberto para fechar.' });
      }

      // 1. ADICIONADO: Calcula totais de todas as movimentações em dinheiro
      const totalVendasDinheiro = await Venda.sum('valor_total', { where: { caixa_id: caixaAberto.id, metodo_pagamento: 'Dinheiro' }, transaction: t }) || 0;
      const totalSuprimentos = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SUPRIMENTO' }, transaction: t }) || 0;
      const totalSangrias = await MovimentacaoCaixa.sum('valor', { where: { caixa_id: caixaAberto.id, tipo: 'SANGRIA' }, transaction: t }) || 0;
      
      // 2. Cálculo final ATUALIZADO do valor esperado em dinheiro
      const valorCalculado = (parseFloat(caixaAberto.valor_inicial) + totalVendasDinheiro + totalSuprimentos) - totalSangrias;
      const valorInformado = parseFloat(valor_final_informado);
      const diferenca = valorInformado - valorCalculado;

      // 3. Atualiza o registro do caixa no banco
      const caixaFechado = await caixaAberto.update({
        data_fechamento: new Date(),
        valor_final_calculado: valorCalculado,
        valor_final_informado: valorInformado,
        diferenca: diferenca,
        status: 'FECHADO',
      }, { transaction: t });

      await t.commit(); // Confirma a transação se tudo deu certo
      return res.json(caixaFechado);
    } catch (error) {
      await t.rollback(); // Desfaz a transação em caso de erro
      return res.status(500).json({ error: 'Erro ao fechar o caixa.', details: error.message });
    }
  }
}

module.exports = new CaixaController();