// backend/src/controllers/ClienteController.js (VERSÃO COMPLETA)
const { Op, fn, col, literal } = require('sequelize'); // Importe as funções do Sequelize
const Cliente = require('../models/Cliente');
const ContaReceber = require('../models/ContaReceber');

class ClienteController {
  async index(req, res) {
    const { page = 1, limit = 10, nome, comDebitos } = req.query; // Novos filtros: nome, comDebitos
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);

    const whereClause = {};
    if (nome) {
      whereClause.nome = { [Op.iLike]: `%${nome}%` };
    }

    // Subconsulta para calcular o saldo devedor de cada cliente
    const saldoDevedorSubquery = `(
      SELECT SUM(valor_total - valor_pago)
      FROM contas_receber
      WHERE contas_receber.cliente_id = "Cliente"."id"
      AND contas_receber.status != 'PAGA'
    )`;
    
    // O 'having' é um filtro que se aplica DEPOIS da agregação (SUM)
    const havingClause = comDebitos === 'true'
      ? literal(`${saldoDevedorSubquery} > 0`)
      : {};

    try {
      const { count, rows: clientes } = await Cliente.findAndCountAll({
        attributes: {
          include: [
            [literal(saldoDevedorSubquery), 'saldo_devedor']
          ]
        },
        where: whereClause,
        having: havingClause,
        order: [['nome', 'ASC']],
        limit: parseInt(limit, 10),
        offset,
        group: ['Cliente.id'], // Agrupamos para que a contagem e o saldo funcionem
        distinct: true
      });

      const totalPages = Math.ceil(count.length / parseInt(limit, 10)); // A contagem com 'group' retorna um array
      return res.json({ clientes, totalPages, currentPage: parseInt(page, 10) });

    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      return res.status(500).json({ error: "Erro ao listar clientes" });
    }
  }

  // Buscar um cliente específico
  async show(req, res) {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      return res.json(cliente);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar cliente.' });
    }
  }

  // Criar novo cliente
  async store(req, res) {
    try {
      const novoCliente = await Cliente.create(req.body);
      return res.status(201).json(novoCliente);
    } catch (error) {
      // Trata erros de validação (ex: CPF duplicado)
      const errorMessage = error.errors ? error.errors.map(e => e.message).join(', ') : 'Erro ao cadastrar cliente.';
      return res.status(400).json({ error: errorMessage });
    }
  }

  // Atualizar um cliente
  async update(req, res) {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      await cliente.update(req.body);
      return res.json(cliente);
    } catch (error) {
      const errorMessage = error.errors ? error.errors.map(e => e.message).join(', ') : 'Erro ao atualizar cliente.';
      return res.status(400).json({ error: errorMessage });
    }
  }

  // Deletar um cliente
  async destroy(req, res) {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      await cliente.destroy();
      return res.status(204).send(); // 204: No Content
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar cliente.' });
    }
  }
}

module.exports = new ClienteController();