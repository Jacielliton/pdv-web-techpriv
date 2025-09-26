// pdv-web-techpriv\backend\src\controllers\VendaController.js (VERSÃO CORRIGIDA)
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');
const Funcionario = require('../models/Funcionario');
const Caixa = require('../models/Caixa');
const Cliente = require('../models/Cliente');
const ContaReceber = require('../models/ContaReceber');

class VendaController {
  // Listar todas as vendas com detalhes
  async index(req, res) {
    const { page = 1, limit = 10, dataInicio, dataFim, metodoPagamento, vendaId } = req.query;
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);

    const whereClause = {};

    if (vendaId) {
      whereClause.id = vendaId;
    }
    // Agora o 'Op.between' funcionará corretamente
    if (dataInicio && dataFim) {
      const dataFimAjustada = new Date(dataFim);
      dataFimAjustada.setHours(23, 59, 59, 999);
      whereClause.data_venda = { [Op.between]: [new Date(dataInicio), dataFimAjustada] };
    }
    if (metodoPagamento) {
      whereClause.metodo_pagamento = metodoPagamento;
    }

    // O middleware de autenticação já adicionou 'userId' e 'userCargo' ao objeto 'req'
    const { userId, userCargo } = req;

    // Se o usuário logado NÃO for um gerente, adicionamos uma condição extra
    // para buscar apenas as vendas cujo 'funcionario_id' seja igual ao ID dele.
    if (userCargo !== 'gerente') {
      whereClause.funcionario_id = userId;
    }

    try {
      // A consulta agora usa a 'whereClause' que pode ou não ter o filtro de funcionário
      const { count, rows: vendas } = await Venda.findAndCountAll({
        where: whereClause,
        order: [['data_venda', 'DESC']],
        include: [
          { model: Funcionario, attributes: ['nome'] },
          { model: Cliente, attributes: ['nome'] },
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

  async cancelar(req, res) {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
      const venda = await Venda.findByPk(id, { include: [VendaItem], transaction: t });
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada.' });
      }
      if (venda.status === 'CANCELADA') {
        return res.status(400).json({ error: 'Esta venda já foi cancelada.' });
      }

      // Estornar itens para o estoque
      for (const item of venda.VendaItems) {
        await Produto.increment('quantidade_estoque', {
          by: item.quantidade,
          where: { id: item.produto_id },
          transaction: t
        });
      }

      venda.status = 'CANCELADA';
      await venda.save({ transaction: t });

      await t.commit();
      return res.json({ message: 'Venda cancelada e estoque estornado com sucesso!' });

    } catch (error) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao cancelar a venda.' });
    }
}

  async show(req, res) {
    try {
      const { id } = req.params;
      const venda = await Venda.findByPk(id, {
        include: [
          // Inclui o nome do funcionário que fez a venda
          { model: Funcionario, attributes: ['nome'] },
          { model: Cliente, attributes: ['nome'] },
          // Inclui os itens da venda
          {
            model: VendaItem,
            attributes: ['quantidade', 'preco_unitario'],
            // Para cada item, inclui o nome do produto
            include: [{ model: Produto, attributes: ['nome'] }],
          },
        ],
      });

      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada.' });
      }

      return res.json(venda);
    } catch (error) {
      console.error("Erro ao buscar detalhes da venda:", error);
      return res.status(500).json({ error: 'Erro interno ao buscar detalhes da venda.' });
    }
  }
  
  // Cadastrar uma nova venda
  async store(req, res) {
  const t = await sequelize.transaction();
  try {    
    const { valor_total, metodo_pagamento, itens, cliente_id, desconto = 0, vendedor_id } = req.body;    
    const funcionario_id = req.userId;

    if (metodo_pagamento === 'A Prazo' && !cliente_id) {
      await t.rollback();
      return res.status(400).json({ error: 'Um cliente deve ser selecionado para vendas a prazo.' });
    }

      // 1. Encontrar o caixa aberto para este funcionário
      const caixaAberto = await Caixa.findOne({
        where: { funcionario_id, status: 'ABERTO' },
        transaction: t
      });

      if (!caixaAberto) {
        await t.rollback();
        return res.status(400).json({ error: 'Nenhum caixa aberto para este funcionário. Inicie uma nova sessão.' });
      }

      // 1. Cria o registro principal da venda
      const novaVenda = await Venda.create({
        funcionario_id,
        valor_total, // Este é o valor final com desconto
        metodo_pagamento,
        caixa_id: caixaAberto.id,
        cliente_id, // Se houver cliente associado
        desconto,   // Salva o valor do desconto para o histórico
        vendedor_id,
      }, { transaction: t });

      // Se a venda for "A Prazo", cria a conta a receber
    if (metodo_pagamento === 'A Prazo') {
      await ContaReceber.create({
        venda_id: novaVenda.id,
        cliente_id,
        valor_total,
        status: 'ABERTA'
      }, { transaction: t });
    }

      // 2. Mapeia os itens do carrinho para o formato do banco de dados
      const itensDaVenda = itens.map(item => ({
        venda_id: novaVenda.id,
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      }));

      // 3. Salva todos os itens da venda no banco
      await VendaItem.bulkCreate(itensDaVenda, { transaction: t });

      // 4. Atualiza o estoque de cada produto vendido
      for (const item of itens) {
        const produto = await Produto.findByPk(item.id, { transaction: t });
        if (!produto || produto.quantidade_estoque < item.quantidade) {
          // Se um produto não existir ou não tiver estoque, desfaz a transação
          await t.rollback();
          return res.status(400).json({ error: `Estoque insuficiente para o produto: ${item.nome}` });
        }
        
        produto.quantidade_estoque -= item.quantidade;
        await produto.save({ transaction: t });
      }

      // Se tudo deu certo, confirma a transação
      await t.commit();
      
      return res.status(201).json({ message: 'Venda registrada com sucesso!', venda: novaVenda });
    }
     catch (error) {
      // Se qualquer erro ocorrer, desfaz todas as operações
      await t.rollback();
      return res.status(500).json({ error: 'Falha ao registrar a venda.', details: error.message });
    }
  }


}

module.exports = new VendaController();