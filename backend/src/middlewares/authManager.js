const Funcionario = require('../models/Funcionario');

module.exports = async (req, res, next) => {
  try {
    // O ID do usuário foi adicionado à requisição pelo middleware de autenticação anterior (auth.js)
    const funcionario = await Funcionario.findByPk(req.userId);

    if (!funcionario) {
      return res.status(401).json({ error: 'Funcionário não encontrado.' });
    }

    // Verifica se o cargo do funcionário é 'gerente'
    if (funcionario.cargo !== 'gerente') {
      return res.status(403).json({ error: 'Acesso negado. Requer permissão de gerente.' });
    }

    // Se for gerente, permite que a requisição continue
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno de autorização.' });
  }
};