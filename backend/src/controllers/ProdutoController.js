// pdv-web-techpriv\backend\src\controllers\ProdutoController.js
const Yup = require('yup');
const Produto = require('../models/Produto');
const EntradaEstoque = require('../models/EntradaEstoque');
const Fornecedor = require('../models/Fornecedor');

class ProdutoController {
  // --- MÉTODO INDEX ATUALIZADO ---
  async index(req, res) {
    const { page } = req.query; // Pega a página, se existir

    // SE a página foi solicitada, retorna os dados paginados
    if (page) {
      const limit = 10;
      const offset = limit * (parseInt(page, 10) - 1);
      try {
        const { count, rows: produtos } = await Produto.findAndCountAll({
          order: [['nome', 'ASC']],
          limit,
          offset,
        });
        const totalPages = Math.ceil(count / limit);
        return res.json({ produtos, totalPages, currentPage: parseInt(page, 10) });
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar produtos paginados.' });
      }
    }

    // SE NENHUMA página foi solicitada, retorna TODOS os produtos
    try {
      const produtos = await Produto.findAll({ order: [['nome', 'ASC']] });
      return res.json(produtos); // Retorna o array diretamente
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar todos os produtos.' });
    }
  }

  // Cadastrar um novo produto
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      preco: Yup.number().positive().required(),
      quantidade_estoque: Yup.number().integer().min(0).required(),
      descricao: Yup.string(),
      codigo_barras: Yup.string(),
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

  // Atualizar um produto
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

  // Deletar um produto
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
            as: 'EntradaEstoques', // Use o alias se definido na associação
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
}

module.exports = new ProdutoController();