//pdv-web-techpriv\backend\src\controllers\ContasReceberController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ContaReceber = require('../models/ContaReceber');
const PagamentoConta = require('../models/PagamentoConta');
const Caixa = require('../models/Caixa');
const Venda = require('../models/Venda');

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
    const { valor, metodo_pagamento } = req.body;
    const { contaId } = req.params;
    const funcionario_id = req.userId;
    const t = await sequelize.transaction();

    try {
      // 1. Tenta encontrar um caixa aberto para o funcionário
      let caixaParaRegistro = await Caixa.findOne({ 
        where: { funcionario_id, status: 'ABERTO' },
        transaction: t 
      });

      // 2. Se NÃO houver caixa aberto, busca o último caixa fechado pelo mesmo funcionário
      if (!caixaParaRegistro) {
        caixaParaRegistro = await Caixa.findOne({
          where: { funcionario_id, status: 'FECHADO' },
          order: [['data_fechamento', 'DESC']], // Pega o mais recente
          transaction: t
        });
      }

      // 3. Se ainda assim não encontrar nenhum caixa, retorna o erro
      if (!caixaParaRegistro) {
        await t.rollback();
        return res.status(400).json({ error: 'Nenhum caixa (aberto ou fechado) encontrado para este funcionário. Abra um novo caixa para continuar.' });
      }

      const conta = await ContaReceber.findByPk(contaId, { transaction: t });
      if (!conta) {
        await t.rollback();
        return res.status(404).json({ error: 'Conta a receber não encontrada.' });
      }

      const valorDevido = parseFloat(conta.valor_total) - parseFloat(conta.valor_pago);
      if (valor > valorDevido) {
        await t.rollback();
        return res.status(400).json({ error: `O valor do pagamento (R$ ${valor.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${valorDevido.toFixed(2)}).` });
      }
      
      // Cria o registro do pagamento usando o ID do caixa encontrado (aberto ou o último fechado)
      await PagamentoConta.create({
        conta_id: conta.id,
        valor,
        metodo_pagamento,
        funcionario_id,
        caixa_id: caixaParaRegistro.id,
      }, { transaction: t });
      
      // Atualiza o valor pago e o status da conta principal
      conta.valor_pago = parseFloat(conta.valor_pago) + valor;
      if (conta.valor_pago >= conta.valor_total) {
        conta.status = 'PAGA';
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