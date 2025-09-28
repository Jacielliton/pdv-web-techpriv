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
  // Adicionar métodos update e delete se necessário...
}

module.exports = new CategoriaController();