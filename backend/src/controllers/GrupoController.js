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
  // Adicionar métodos update e delete se necessário...
}

module.exports = new GrupoController();