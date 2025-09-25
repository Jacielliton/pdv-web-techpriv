// frontend/src/components/ListaProdutosLinha.js
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from '@mui/material';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

// 1. ESTE COMPONENTE TAMBÉM RECEBE 'produtosFiltrados' DIRETAMENTE
const ListaProdutosLinha = ({ produtosFiltrados, onAdicionarAoCarrinho }) => {

  return (
    <Paper sx={{ flex: 1, overflowY: 'auto' }}>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="center">Estoque</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtosFiltrados.map((produto) => {
              const semEstoque = produto.quantidade_estoque <= 0;
              return (
                <TableRow key={produto.id} hover sx={{ opacity: semEstoque ? 0.5 : 1 }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{produto.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{produto.codigo_barras}</Typography>
                  </TableCell>
                  <TableCell align="center">{produto.quantidade_estoque}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(produto.preco)}
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" size="small" onClick={() => onAdicionarAoCarrinho(produto)} disabled={semEstoque}>
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ListaProdutosLinha;