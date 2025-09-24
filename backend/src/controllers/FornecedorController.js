// backend/src/controllers/FornecedorController.js
const Fornecedor = require('../models/Fornecedor');

class FornecedorController {
  async index(req, res) {
    try {
      const fornecedores = await Fornecedor.findAll({ order: [['nome_fantasia', 'ASC']] });
      return res.json({ fornecedores });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar fornecedores.' });
    }
  }

  async store(req, res) {
    try {
      const novoFornecedor = await Fornecedor.create(req.body);
      return res.status(201).json(novoFornecedor);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao cadastrar fornecedor.' });
    }
  }

  async update(req, res) {
    try {
      const fornecedor = await Fornecedor.findByPk(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }
      await fornecedor.update(req.body);
      return res.json(fornecedor);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar fornecedor.' });
    }
  }

  async delete(req, res) {
    try {
      const fornecedor = await Fornecedor.findByPk(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }
      await fornecedor.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar fornecedor.' });
    }
  }
}

module.exports = new FornecedorController();