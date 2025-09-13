const request = require('supertest');
const app = require('../server'); // Importa nossa aplicação Express
const Produto = require('../models/Produto');

describe('Testes da API', () => {
  let token;

  // Antes de todos os testes, faz login para obter um token
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@email.com', // Use um usuário válido do seu banco
        senha: '15121992'       // Use a senha correta
      });
    
    token = response.body.token;
    expect(token).toBeDefined();
  });

  // Teste para a rota de status (conexões)
  it('GET /api/status - Deve retornar o status da aplicação e do banco', async () => {
    const response = await request(app).get('/api/status');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'UP',
      database: 'connected'
    });
  });

  // Teste para buscar produtos
  it('GET /api/produtos - Deve buscar a lista de produtos com sucesso', async () => {
    const response = await request(app)
      .get('/api/produtos')
      .set('Authorization', `Bearer ${token}`); // Usa o token para autenticar

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Espera que a resposta seja um array
    expect(response.body.length).toBeGreaterThan(0); // Espera que tenha pelo menos um produto (baseado nos nossos exemplos)
    expect(response.body[0]).toHaveProperty('nome'); // Verifica se o primeiro item tem a propriedade 'nome'
  });

  // Teste para tentar buscar produtos sem token
  it('GET /api/produtos - Deve falhar ao buscar produtos sem token', async () => {
    const response = await request(app).get('/api/produtos');

    expect(response.statusCode).toBe(401); // Espera um erro de "Não Autorizado"
    expect(response.body.error).toBe('Token não fornecido.');
  });
});

// ADICIONE ESTE NOVO BLOCO DE TESTES PARA VENDAS
describe('Testes da API - Rota de Vendas', () => {
  let token;

  // Faz login antes dos testes de venda
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@email.com',
        senha: '15121992'
      });
    token = response.body.token;
  });

  it('POST /api/vendas - Deve registrar uma nova venda e atualizar o estoque', async () => {
    // Passo 1: Pegar o estado inicial do estoque de um produto
    // Usando o produto com ID 1 (Coca-Cola) como exemplo
    const produtoAntes = await Produto.findByPk(1);
    const estoqueInicial = produtoAntes.quantidade_estoque;

    // Passo 2: Simular um carrinho de compras
    const dadosDaVenda = {
      valor_total: 9.00,
      metodo_pagamento: 'Pix',
      itens: [
        { id: 1, nome: 'Coca-Cola Lata 350ml', quantidade: 2, preco: 4.50 }
      ]
    };

    // Passo 3: Fazer a requisição para registrar a venda
    const response = await request(app)
      .post('/api/vendas')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosDaVenda);

    // Passo 4: Verificar se a venda foi criada com sucesso
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Venda registrada com sucesso!');
    expect(response.body.venda).toHaveProperty('id');

    // Passo 5: Verificar se o estoque foi atualizado corretamente no banco
    const produtoDepois = await Produto.findByPk(1);
    const estoqueFinal = produtoDepois.quantidade_estoque;

    expect(estoqueFinal).toBe(estoqueInicial - 2); // O estoque deve ter diminuído em 2 unidades
  });
});