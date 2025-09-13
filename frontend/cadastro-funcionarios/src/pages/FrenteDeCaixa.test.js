import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para ter acesso a matchers como .toBeInTheDocument()
import axios from 'axios';
import { AuthProvider } from '../contexts/auth'; // Importamos o provider para envolver o componente
import FrenteDeCaixa from './FrenteDeCaixa';

// Simula o módulo axios
jest.mock('axios');

// Um wrapper customizado para incluir o AuthProvider, já que nosso componente usa o useAuth()
const renderWithAuthProvider = (component) => {
  // Mock do valor do contexto de autenticação
  const mockAuthContext = {
    user: { nome: 'Usuário Teste' },
    signed: true,
    // Adicione outras funções/valores do contexto se o componente precisar
  };
  
  // Simula o hook useAuth para retornar nosso valor mockado
  jest.spyOn(require('../contexts/auth'), 'useAuth').mockReturnValue(mockAuthContext);
  
  return render(
    <AuthProvider value={mockAuthContext}>
      {component}
    </AuthProvider>
  );
};


describe('Página FrenteDeCaixa', () => {
  it('deve permitir ao usuário adicionar um produto ao carrinho e finalizar a venda', async () => {
    // 1. Dados e respostas simuladas da API
    const mockProdutos = [
      { id: 1, nome: 'Produto A', preco: '10.00', quantidade_estoque: 10, codigo_barras: '123' },
      { id: 2, nome: 'Produto B', preco: '25.50', quantidade_estoque: 5, codigo_barras: '456' },
    ];
    axios.get.mockResolvedValue({ data: mockProdutos });
    axios.post.mockResolvedValue({ data: { message: 'Venda finalizada com sucesso!' } });

    // 2. Renderiza a página
    renderWithAuthProvider(<FrenteDeCaixa />);

    // 3. Simula a busca por um produto
    const inputBusca = screen.getByPlaceholderText(/digite o nome ou código de barras/i);
    fireEvent.change(inputBusca, { target: { value: 'Produto A' } });
    
    // 4. Simula o clique para adicionar o produto ao carrinho
    const itemEncontrado = await screen.findByText(/Produto A - R\$ 10.00/i);
    fireEvent.click(itemEncontrado);

    // 5. Verifica se o item está no carrinho e se o total foi atualizado
    expect(await screen.findByText('Produto A')).toBeInTheDocument();
    //expect(screen.getByText('R$ 10.00')).toBeInTheDocument(); // Verifica o subtotal do item
    expect(screen.getByText(/Total: R\$ 10.00/i)).toBeInTheDocument();

    // 6. Simula o clique no botão de finalizar a venda
    const botaoFinalizar = screen.getByText(/Finalizar Venda/i);
    fireEvent.click(botaoFinalizar);

    // 7. Verifica se a chamada POST para a API foi feita corretamente
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3333/api/vendas',
        expect.objectContaining({
          valor_total: 10.00,
          metodo_pagamento: 'Dinheiro',
          itens: expect.any(Array),
        })
      );
    });

    // 8. Verifica se a mensagem de sucesso apareceu
    expect(await screen.findByText('Venda finalizada com sucesso!')).toBeInTheDocument();
  });
});