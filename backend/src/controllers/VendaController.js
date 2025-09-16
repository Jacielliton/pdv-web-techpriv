const sequelize = require('../config/database');
const Venda = require('../models/Venda');
const VendaItem = require('../models/VendaItem');
const Produto = require('../models/Produto');
const Funcionario = require('../models/Funcionario');
const Caixa = require('../models/Caixa');

class VendaController {

  // Listar todas as vendas com detalhes
  async index(req, res) {
    try {
      const vendas = await Venda.findAll({
        // Ordena as vendas da mais recente para a mais antiga
        order: [['data_venda', 'DESC']],
        // Inclui os dados dos models associados
        include: [
          {
            model: Funcionario,
            attributes: ['nome'], // Pega apenas o nome do funcionário
          },
          {
            model: VendaItem,
            attributes: ['quantidade', 'preco_unitario'], // Pega a quantidade e o preço
            include: [{
              model: Produto,
              attributes: ['nome'], // Pega o nome do produto de cada item
            }],
          },
        ],
      });

      return res.json(vendas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar histórico de vendas.', details: error.message });
    }
  }
  
  // Cadastrar uma nova venda
  async store(req, res) {
    // Inicia uma transação
    const t = await sequelize.transaction();

    try {
      const { valor_total, metodo_pagamento, itens } = req.body;
      const funcionario_id = req.userId; // Vem do middleware de autenticação

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
        valor_total,
        metodo_pagamento,
        caixa_id: caixaAberto.id, // <-- PASSANDO O ID DO CAIXA
      }, { transaction: t });

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

    } catch (error) {
      // Se qualquer erro ocorrer, desfaz todas as operações
      await t.rollback();
      return res.status(500).json({ error: 'Falha ao registrar a venda.', details: error.message });
    }
  }


}

module.exports = new VendaController();