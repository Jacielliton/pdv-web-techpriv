// pdv-web-techpriv\backend\src\controllers\FuncionarioController.js
const Funcionario = require('../models/Funcionario');
const Yup = require('yup');

class FuncionarioController {
  // Método para cadastrar um novo funcionário
  async store(req, res) {
    // Define um esquema de validação
    const schema = Yup.object().shape({
      nome: Yup.string().required('O nome é obrigatório.'),
      cargo: Yup.string().required('O cargo é obrigatório.'),
      email: Yup.string().email('Formato de e-mail inválido.').required('O e-mail é obrigatório.'),
      senha: Yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').required('A senha é obrigatória.'),
    });

    try {
      // Valida o corpo da requisição
      await schema.validate(req.body, { abortEarly: false });
      const { nome, cargo, email, senha } = req.body;     

      // Renomeamos 'senha' para 'senha_hash' para corresponder ao modelo
      const novoFuncionario = await Funcionario.create({ nome, cargo, email, senha_hash: senha });
      
      // Não retorne a senha_hash na resposta
      const { senha_hash, ...funcionarioCriado } = novoFuncionario.get({ plain: true });

      return res.status(201).json(funcionarioCriado);
    } catch (error) {
      // Verifica se o erro é de e-mail duplicado
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
        const funcionarios = await Funcionario.findAll({
            attributes: ['id', 'nome', 'cargo', 'email', 'data_cadastro'] // Exclui o hash da senha
        });
        return res.json(funcionarios);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar funcionários.' });
    }
  }

    // Método para atualizar um funcionário
    async update(req, res) {
        try {
            const { id } = req.params;
            // Capture também a 'senha' do corpo da requisição
            const { nome, cargo, email, senha } = req.body;

            const funcionario = await Funcionario.findByPk(id);

            if (!funcionario) {
                return res.status(404).json({ error: 'Funcionário não encontrado.' });
            }

            // Atualize os campos
            funcionario.nome = nome;
            funcionario.cargo = cargo;
            funcionario.email = email;

            // Se uma nova senha foi fornecida, atualize-a também
            if (senha) {
                funcionario.senha_hash = senha;
            }

            await funcionario.save();
            
            const { senha_hash, ...funcionarioAtualizado } = funcionario.get({ plain: true });

            return res.json(funcionarioAtualizado);
        }catch (error) {
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

            return res.status(204).send(); // 204 No Content - sucesso sem corpo de resposta
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir funcionário.' });
        }
    }
    
}

module.exports = new FuncionarioController();