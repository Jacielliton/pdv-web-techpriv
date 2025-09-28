// backend/src/controllers/CategoriaController.js (NOVO ARQUIVO)
const Categoria = require('../models/Categoria');

class CategoriaController {
  async index(req, res) {
    try {
      const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
      return res.json(categorias);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar categorias.' });
    }
  }
  async store(req, res) {
    try {
      const categoria = await Categoria.create(req.body);
      return res.status(201).json(categoria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
  }
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }
      await categoria.destroy();
      return res.status(204).send();
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'Não é possível excluir. Existem produtos associados a esta categoria.' });
      }
      return res.status(500).json({ error: 'Erro ao deletar categoria.' });
    }
  }
}

module.exports = new CategoriaController();