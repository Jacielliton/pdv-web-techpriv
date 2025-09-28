//pdv-web-techpriv\backend\src\controllers\ContasReceberController.js (VERSÃO CORRIGIDA)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ContaReceber = require('../models/ContaReceber');
const PagamentoConta = require('../models/PagamentoConta');
const Caixa = require('../models/Caixa');
const Venda = require('../models/Venda');

// Função auxiliar para arredondar números com precisão
const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

class ContasReceberController {
  // O método 'index' permanece o mesmo
  async index(req, res) {
    try {
      const contas = await ContaReceber.findAll({
        where: { cliente_id: req.params.clienteId },
        include: [{ model: Venda, attributes: ['id', 'data_venda'] }],
        order: [['id', 'DESC']]
      });
      return res.json(contas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar contas a receber.' });
    }
  }

  // Registra um pagamento para uma conta
  async registrarPagamento(req, res) {
    // CORREÇÃO: Converte o valor para número e arredonda na entrada
    const valorPagamento = round(parseFloat(req.body.valor));
    const { metodo_pagamento } = req.body;
    const { contaId } = req.params;
    const funcionario_id = req.userId;
    const t = await sequelize.transaction();

    try {
      let caixaParaRegistro = await Caixa.findOne({ 
        where: { funcionario_id, status: 'ABERTO' },
        transaction: t 
      });

      if (!caixaParaRegistro) {
        caixaParaRegistro = await Caixa.findOne({
          where: { funcionario_id, status: 'FECHADO' },
          order: [['data_fechamento', 'DESC']],
          transaction: t
        });
      }

      if (!caixaParaRegistro) {
        await t.rollback();
        return res.status(400).json({ error: 'Nenhum caixa (aberto ou fechado) encontrado para este funcionário. Abra um novo caixa para continuar.' });
      }

      const conta = await ContaReceber.findByPk(contaId, { transaction: t });
      if (!conta) {
        await t.rollback();
        return res.status(404).json({ error: 'Conta a receber não encontrada.' });
      }

      // CORREÇÃO: Calcula o valor devido usando a função de arredondamento
      const valorDevido = round(parseFloat(conta.valor_total) - parseFloat(conta.valor_pago));

      // CORREÇÃO: A comparação agora é precisa e não sofre com imprecisão de float
      if (valorPagamento > valorDevido) {
        await t.rollback();
        // A mensagem de erro agora usa os valores arredondados para ser clara
        return res.status(400).json({ error: `O valor do pagamento (R$ ${valorPagamento.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${valorDevido.toFixed(2)}).` });
      }
      
      await PagamentoConta.create({
        conta_id: conta.id,
        valor: valorPagamento, // Usa o valor já arredondado
        metodo_pagamento,
        funcionario_id,
        caixa_id: caixaParaRegistro.id,
      }, { transaction: t });
      
      // CORREÇÃO: Atualiza o valor pago da conta com arredondamento
      const novoValorPago = round(parseFloat(conta.valor_pago) + valorPagamento);
      conta.valor_pago = novoValorPago;
      
      // CORREÇÃO: Compara o novo valor pago com o valor total de forma segura
      if (novoValorPago >= parseFloat(conta.valor_total)) {
        conta.status = 'PAGA';
        // Garante que o valor pago não exceda o valor total por frações de centavos
        conta.valor_pago = parseFloat(conta.valor_total);
      } else {
        conta.status = 'PAGA_PARCIALMENTE';
      }

      await conta.save({ transaction: t });
      
      await t.commit();
      return res.json({ message: 'Pagamento registrado com sucesso!', conta });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao registrar pagamento.', details: error.message });
    }
  }
}
module.exports = new ContasReceberController();