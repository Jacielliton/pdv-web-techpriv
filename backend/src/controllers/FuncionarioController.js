// pdv-web-techpriv\backend\src/controllers\FuncionarioController.js (VERSÃO COMPLETA E CORRIGIDA)
const Funcionario = require('../models/Funcionario');
const Yup = require('yup');
const bcrypt = require('bcryptjs');

class FuncionarioController {
  
  // --- FUNÇÃO FALTANDO ---
  // Método para listar todos os funcionários
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 10;
    const offset = limit * (page - 1);

    try {
      const { count, rows: funcionarios } = await Funcionario.findAndCountAll({
        attributes: ['id', 'nome', 'cargo', 'email'],
        order: [['nome', 'ASC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);
      return res.json({ funcionarios, totalPages, currentPage: parseInt(page, 10) });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar funcionários.' });
    }
  }
  // -------------------------

  // Método para cadastrar um novo funcionário
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required('O nome é obrigatório.'),
      cargo: Yup.string().required('O cargo é obrigatório.'),
      email: Yup.string().email('Formato de e-mail inválido.').required('O e-mail é obrigatório.'),
      senha: Yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').required('A senha é obrigatória.'),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
      const { nome, cargo, email, senha } = req.body;
      const senha_hash = await bcrypt.hash(senha, 8);

      const novoFuncionario = await Funcionario.create({
        nome,
        cargo,
        email,
        senha_hash,
      });
      
      return res.status(201).json(novoFuncionario);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({ error: 'Erro de validação.', details: error.errors });
      }
      console.error('ERRO AO CADASTRAR FUNCIONÁRIO:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar funcionário.', details: error.message });
    }
  }

  // Método para atualizar um funcionário
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, cargo, email, senha } = req.body;

      const funcionario = await Funcionario.unscoped().findByPk(id);

      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado.' });
      }
      
      if (senha) {
        funcionario.senha_hash = await bcrypt.hash(senha, 8);
      }
      
      funcionario.nome = nome;
      funcionario.cargo = cargo;
      funcionario.email = email;

      await funcionario.save();
      
      const { senha_hash, ...dadosAtualizados } = funcionario.get();
      return res.json(dadosAtualizados);

    } catch (error) {
        // (Adicione aqui o tratamento de erro similar ao do método store)
        return res.status(500).json({ error: 'Erro ao atualizar funcionário.', details: error.message });
    }
  }

  // Método para excluir um funcionário
  async delete(req, res) {
    try {
      const { id } = req.params;
      const funcionario = await Funcionario.findByPk(id);

      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado.' });
      }

      await funcionario.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir funcionário.', details: error.message });
    }
  }
}

module.exports = new FuncionarioController();