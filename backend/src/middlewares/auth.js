// pdv-web-techpriv\backend\src\middlewares\auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Transforma uma função de callback em uma Promise

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer eyJhbGciOi..."
  // A linha abaixo separa o "Bearer" do token em si
  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Inclui o ID do usuário logado em todas as requisições autenticadas
    req.userId = decoded.id;

    return next(); // Se o token for válido, permite que a requisição continue
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};