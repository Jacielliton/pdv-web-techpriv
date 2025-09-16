// pdv-web-techpriv\backend\src/controllers\FuncionarioController.js (VERSÃO CORRIGIDA)
const Funcionario = require('../models/Funcionario');
const Yup = require('yup');

class FuncionarioController {
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
      
      // --- CORREÇÃO APLICADA ---
      // Passamos o req.body diretamente. O modelo usará o campo virtual 'senha'
      // e o hook beforeCreate irá gerar o 'senha_hash' automaticamente.
      const novoFuncionario = await Funcionario.create(req.body);
      
      return res.status(201).json(novoFuncionario);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({ error: 'Erro de validação.', details: error.errors });
      }
      return res.status(500).json({ error: 'Erro ao cadastrar funcionário.', details: error.message });
    }
  }

  // Método para listar todos os funcionários
  async index(req, res) {
    try {
      // --- CORREÇÃO APLICADA ---
      // Removemos 'data_cadastro' pois não está definido no modelo Sequelize.
      const funcionarios = await Funcionario.findAll({
        attributes: ['id', 'nome', 'cargo', 'email'],
        order: [['nome', 'ASC']],
      });
      return res.json(funcionarios);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar funcionários.', details: error.message });
    }
  }

  // Método para atualizar um funcionário
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, cargo, email, senha } = req.body;

      // Usamos .unscoped() para poder editar um usuário sem que o hash seja excluído
      const funcionario = await Funcionario.unscoped().findByPk(id);

      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado.' });
      }

      // --- CORREÇÃO APLICADA ---
      // Se uma nova senha foi fornecida, a atribuímos ao campo virtual 'senha'.
      // O hook 'beforeUpdate' do modelo cuidará de gerar o novo hash.
      if (senha) {
        funcionario.senha = senha;
      }
      
      // Atualizamos os outros campos
      funcionario.nome = nome;
      funcionario.cargo = cargo;
      funcionario.email = email;

      await funcionario.save();
      
      return res.json({
        id: funcionario.id,
        nome: funcionario.nome,
        email: funcionario.email,
        cargo: funcionario.cargo
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
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