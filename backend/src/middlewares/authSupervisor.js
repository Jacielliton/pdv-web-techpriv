// backend/src/middlewares/authSupervisor.js (NOVO ARQUIVO)
const Funcionario = require('../models/Funcionario');

// Este middleware verifica se o usuário é Supervisor OU Gerente
module.exports = async (req, res, next) => {
  try {
    const funcionario = await Funcionario.findByPk(req.userId, {
      attributes: ['id', 'nome', 'cargo'] // Pega apenas os atributos necessários
    });

    if (!funcionario) {
      return res.status(401).json({ error: 'Funcionário não encontrado.' });
    }

    // Verifica se o cargo permite a ação
    if (funcionario.cargo !== 'gerente' && funcionario.cargo !== 'supervisor') {
      return res.status(403).json({ error: 'Acesso negado. Requer permissão de supervisor ou gerente.' });
    }

    // Adiciona o cargo à requisição para uso futuro, se necessário
    req.userCargo = funcionario.cargo;
    
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno de autorização.' });
  }
};