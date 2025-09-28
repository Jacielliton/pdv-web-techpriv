// backend/src/controllers/GrupoController.js (NOVO ARQUIVO)
const Grupo = require('../models/Grupo');

class GrupoController {
  async index(req, res) {
    try {
      const grupos = await Grupo.findAll({ order: [['nome', 'ASC']] });
      return res.json(grupos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar grupos.' });
    }
  }
  async store(req, res) {
    try {
      const grupo = await Grupo.create(req.body);
      return res.status(201).json(grupo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar grupo.' });
    }
  }
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const grupo = await Grupo.findByPk(id);
      if (!grupo) {
        return res.status(404).json({ error: 'Grupo não encontrado.' });
      }
      await grupo.destroy();
      return res.status(204).send(); // 204 No Content -> sucesso sem corpo de resposta
    } catch (error) {
      // Trata erro caso um produto ainda esteja associado a este grupo
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'Não é possível excluir. Existem produtos associados a este grupo.' });
      }
      return res.status(500).json({ error: 'Erro ao deletar grupo.' });
    }
  }
}

module.exports = new GrupoController();