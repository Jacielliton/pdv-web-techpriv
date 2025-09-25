// frontend/src/components/GridProdutosVenda.js (VERSÃO FINAL E CORRIGIDA)

import React, { useMemo } from 'react';
import { Grid, TextField, Paper, Box, Typography } from '@mui/material'; // Adicione Typography
import ProdutoCard from './ProdutoCard';
import { toast } from 'react-toastify';

const GridProdutosVenda = React.forwardRef(({ 
  produtos, 
  termoBusca, 
  onTermoBuscaChange, 
  onAdicionarAoCarrinho 
}, ref) => {

  const produtosFiltrados = useMemo(() => {
    let filtrados = produtos;
    if (termoBusca.trim() !== '') {
      filtrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(termoBusca))
      );
    }
    // 1. LIMITA A EXIBIÇÃO A APENAS 20 ITENS
    return filtrados.slice(0, 20);
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
        {/* 2. AJUSTE NO GRID PARA GARANTIR ALINHAMENTO */}
        <Grid container spacing={2}>
          {produtosFiltrados.length > 0 ? (
            produtosFiltrados.map(produto => (
              <Grid item key={produto.id} xs={6} sm={4} md={3} xl={2} sx={{ display: 'flex' }}>
                <ProdutoCard produto={produto} onProdutoClick={onAdicionarAoCarrinho} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                Nenhum produto encontrado.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
});

export default GridProdutosVenda;