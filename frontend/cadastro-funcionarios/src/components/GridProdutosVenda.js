// frontend/src/components/GridProdutosVenda.js (VERSÃO SIMPLIFICADA)
import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import ProdutoCard from './ProdutoCard';

// 1. REMOVEMOS A LÓGICA DE FILTRAGEM E PASSAMOS A RECEBER 'produtosFiltrados' DIRETAMENTE
const GridProdutosVenda = ({ produtosFiltrados, onAdicionarAoCarrinho }) => {

  return (
    <Paper sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
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
  );
};

export default GridProdutosVenda;