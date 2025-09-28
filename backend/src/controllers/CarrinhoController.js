// backend/src/controllers/CarrinhoController.js (NOVO ARQUIVO)
const CarrinhoSalvo = require('../models/CarrinhoSalvo');
const Cliente = require('../models/Cliente');
const Funcionario = require('../models/Funcionario');

class CarrinhoController {
  // Método para buscar o carrinho do usuário logado
  async show(req, res) {
    try {
      const carrinho = await CarrinhoSalvo.findOne({
        where: { funcionario_id: req.userId },
        include: [
          { model: Cliente, attributes: ['id', 'nome'] },
          { model: Funcionario, as: 'Vendedor', attributes: ['id', 'nome'] }
        ]
      });

      if (!carrinho) {
        // Se não houver carrinho, retorna um objeto vazio para o frontend
        return res.json(null);
      }

      return res.json(carrinho);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar carrinho salvo.' });
    }
  }

  // Método para criar ou atualizar o carrinho do usuário logado
  async update(req, res) {
    const { conteudo, cliente_id, vendedor_id, desconto } = req.body;
    
    try {
      // 'upsert' cria um novo registro se não existir, ou atualiza se já existir
      const [carrinho, created] = await CarrinhoSalvo.upsert({
        funcionario_id: req.userId,
        conteudo: conteudo || [],
        cliente_id: cliente_id || null,
        vendedor_id: vendedor_id || null,
        desconto: desconto || 0,
      });

      return res.json(carrinho);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar carrinho.' });
    }
  }
}

module.exports = new CarrinhoController();