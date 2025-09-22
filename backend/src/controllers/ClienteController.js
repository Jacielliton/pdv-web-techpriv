// backend/src/controllers/ClienteController.js (VERSÃO COMPLETA)
const { Op } = require('sequelize');
const Cliente = require('../models/Cliente');

class ClienteController {
  async index(req, res) {
    // 1. RECEBE OS PARÂMETROS DE PAGINAÇÃO
    const { page = 1, limit = 10, nome } = req.query;
    const offset = parseInt(limit, 10) * (parseInt(page, 10) - 1);

    const whereClause = nome ? { nome: { [Op.iLike]: `%${nome}%` } } : {};
    
    try {
      // 2. USA findAndCountAll PARA CONTAR O TOTAL DE REGISTROS
      const { count, rows: clientes } = await Cliente.findAndCountAll({
        where: whereClause,
        order: [['nome', 'ASC']],
        limit: parseInt(limit, 10),
        offset,
        distinct: true
      });

      // 3. CALCULA O TOTAL DE PÁGINAS E ENVIA NA RESPOSTA
      const totalPages = Math.ceil(count / parseInt(limit, 10));
      return res.json({ clientes, totalPages, currentPage: parseInt(page, 10) });

    } catch (error) {
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