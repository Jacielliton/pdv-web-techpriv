const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Caixa = require('../models/Caixa');
const Venda = require('../models/Venda');

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
}

module.exports = new CaixaController();