// frontend/src/components/GridProdutosVenda.js (VERSÃO FINAL E CORRIGIDA)

import React, { useMemo } from 'react';
import { Grid, TextField, Paper, Box } from '@mui/material';
import ProdutoCard from './ProdutoCard';
import { toast } from 'react-toastify';

// A sintaxe correta envolve declarar o componente com forwardRef primeiro
const GridProdutosVenda = React.forwardRef(({ 
  produtos, 
  termoBusca, 
  onTermoBuscaChange, 
  onAdicionarAoCarrinho 
}, ref) => {

  const produtosFiltrados = useMemo(() => {
    if (!termoBusca) return produtos;
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(termoBusca))
    );
  }, [termoBusca, produtos]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && termoBusca.trim() !== '') {
      event.preventDefault();
      
      const produtoEncontrado = produtos.find(p => p.codigo_barras === termoBusca.trim());

      if (produtoEncontrado) {
        onAdicionarAoCarrinho(produtoEncontrado);
        onTermoBuscaChange('');
      } else {
        toast.warn('Produto não encontrado pelo código de barras.');
      }
    }
  };

  return (
    <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Buscar Produto (F4) ou Ler Código de Barras"
        variant="outlined"
        value={termoBusca}
        onChange={e => onTermoBuscaChange(e.target.value)}
        onKeyDown={handleKeyDown}
        inputRef={ref}
        autoFocus
      />
      <Paper sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {produtosFiltrados.map(produto => (
            <Grid item key={produto.id} xs={6} sm={4} md={3} xl={2}>
              <ProdutoCard produto={produto} onProdutoClick={onAdicionarAoCarrinho} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
});

// E então exportar a constante
export default GridProdutosVenda;