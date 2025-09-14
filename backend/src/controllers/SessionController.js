// pdv-web-techpriv\backend\src\controllers\SessionController.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Funcionario = require('../models/Funcionario');

class SessionController {
  async store(req, res) {
    const { email, senha } = req.body;

    // 1. Verificar se o funcionário existe
    const funcionario = await Funcionario.findOne({ where: { email } });
    if (!funcionario) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    // 2. Verificar se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const { id, nome, cargo } = funcionario;

    // 3. Gerar o Token JWT
    const token = jwt.sign(
      { id: id, cargo: cargo }, // Payload: informações que estarão dentro do token
      process.env.JWT_SECRET, // Chave secreta para assinar o token
      { expiresIn: '1d' } // Opções, como a data de expiração (1 dia)
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