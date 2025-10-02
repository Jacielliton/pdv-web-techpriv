// pdv-web-techpriv\backend\src\controllers\ProdutoController.js (VERSÃO ATUALIZADA)
const Yup = require('yup');
const { Op } = require('sequelize');
const Produto = require('../models/Produto');
const EntradaEstoque = require('../models/EntradaEstoque');
const Fornecedor = require('../models/Fornecedor');
const Grupo = require('../models/Grupo');       
const Categoria = require('../models/Categoria'); 

class ProdutoController {
  async index(req, res) {
    // ===================================================================
    // ALTERAÇÃO: Recebendo os novos parâmetros de filtro
    // ===================================================================
    const { page = 1, limit = 10, nome, grupo_id, categoria_id } = req.query;
    const offset = limit * (parseInt(page, 10) - 1);

    const whereClause = {};
    if (nome) {
      whereClause.nome = { [Op.iLike]: `%${nome}%` };
    }
    // ===================================================================
    // ALTERAÇÃO: Adicionando os novos filtros à cláusula WHERE
    // ===================================================================
    if (grupo_id) {
      whereClause.grupo_id = grupo_id;
    }
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }

    try {
      const { count, rows: produtos } = await Produto.findAndCountAll({
        where: whereClause, // A cláusula WHERE agora pode conter os novos filtros
        include: [
          { model: Grupo, attributes: ['nome'] },
          { model: Categoria, attributes: ['nome'] },
        ],
        order: [['nome', 'ASC']],
        limit: parseInt(limit, 10), // Garantir que o limite seja um número
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / parseInt(limit, 10)); // Garantir que o limite seja um número
      return res.json({ produtos, totalPages, currentPage: parseInt(page, 10) });

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
  }

  // O restante do controller (store, update, delete, getDetalhes) permanece o mesmo.
  // Cole o código completo abaixo para garantir.
  
  // <editor-fold desc="Código restante do controller (sem alterações)">
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      preco: Yup.number().positive().required(),
      quantidade_estoque: Yup.number().integer().min(0).required(),
      descricao: Yup.string(),
      codigo_barras: Yup.string(),
      grupo_id: Yup.number().integer().nullable(),
      categoria_id: Yup.number().integer().nullable(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });

      const novoProduto = await Produto.create(req.body);
      return res.status(201).json(novoProduto);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({ error: 'Erro de validação.', details: error.errors });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Código de barras já cadastrado.' });
      }
      return res.status(500).json({ error: 'Erro ao cadastrar produto.', details: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      const produtoAtualizado = await produto.update(req.body);
      return res.json(produtoAtualizado);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar produto.', details: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      await produto.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
  }
  
  async getDetalhes(req, res) {
    try {
      const { id } = req.params;
      const produto = await Produto.findByPk(id, {
        include: [
          {
            model: EntradaEstoque,
            as: 'EntradaEstoques',
            include: [{ model: Fornecedor, attributes: ['nome_fantasia'] }],
            order: [['data_entrada', 'DESC']],
          }
        ]
      });

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar detalhes do produto.', details: error.message });
    }
  }
  // </editor-fold>
}

module.exports = new ProdutoController();