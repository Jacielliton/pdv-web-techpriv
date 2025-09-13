//pdv-web-techpriv\frontend\cadastro-funcionarios\src\components\ListaProdutos.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListaProdutos from './ListaProdutos';

// Simula o módulo axios
jest.mock('axios');

describe('Componente ListaProdutos', () => {
  it('deve renderizar a lista de produtos buscada da API', async () => {
    // Dados simulados que a API retornaria
    const mockedProdutos = [
      { id: 1, nome: 'Produto Teste 1', preco: '10.50', quantidade_estoque: 100, codigo_barras: '123' },
      { id: 2, nome: 'Produto Teste 2', preco: '20.00', quantidade_estoque: 50, codigo_barras: '456' },
    ];

    // Configura o axios.get para retornar nossos dados simulados
    axios.get.mockResolvedValueOnce({ data: mockedProdutos });

    // Renderiza o componente
    render(<ListaProdutos />);
    
    // Espera até que os elementos apareçam na tela (após a chamada da API simulada)
    await waitFor(() => {
      expect(screen.getByText('Produto Teste 1')).toBeInTheDocument();
      expect(screen.getByText('Produto Teste 2')).toBeInTheDocument();
    });

    // Verifica se a função get do axios foi chamada com a URL correta
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3333/api/produtos');
  });
});