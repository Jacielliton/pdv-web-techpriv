// pdv-web-techpriv\backend\src\controllers\SessionController.js (VERSÃO CORRIGIDA)
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Funcionario = require('../models/Funcionario');

class SessionController {
  async store(req, res) {
    const { email, senha } = req.body;

    // 1. Verificar se o funcionário existe
    // ALTERAÇÃO: Adicionado .unscoped() para buscar o hash da senha, que está oculto por padrão
    const funcionario = await Funcionario.unscoped().findOne({ where: { email } });
    if (!funcionario) {
      // Usamos uma mensagem genérica por segurança
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    // 2. Verificar se a senha está correta
    // Agora, funcionario.senha_hash não será 'undefined'
    const senhaCorreta = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const { id, nome, cargo } = funcionario;

    // 3. Gerar o Token JWT
    const token = jwt.sign(
      { id: id, cargo: cargo },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Retornar os dados do usuário e o token
    return res.json({
      funcionario: {
        id,
        nome,
        email,
        cargo,
      },
      token,
    });
  }
}

module.exports = new SessionController();