// frontend/src/components/GridProdutosVenda.js

import React, { useState, useMemo } from 'react';
import { Grid, TextField, Paper, Box } from '@mui/material';
import ProdutoCard from './ProdutoCard';

const GridProdutosVenda = ({ produtos, onAdicionarAoCarrinho }) => {
  const [termoBusca, setTermoBusca] = useState('');

  const produtosFiltrados = useMemo(() => {
    if (!termoBusca) return produtos;
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(termoBusca))
    );
  }, [termoBusca, produtos]);

  return (
    <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Buscar Produto por nome ou código de barras"
        variant="outlined"
        value={termoBusca}
        onChange={e => setTermoBusca(e.target.value)}
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
};

export default GridProdutosVenda;