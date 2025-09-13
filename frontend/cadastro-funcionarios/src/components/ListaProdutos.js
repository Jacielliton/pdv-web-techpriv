// src/components/ListaProdutos.js (VERSÃO COM MUI)
import React from 'react';
import axios from 'axios';
// Importando componentes de Tabela e Ícones do MUI
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Typography 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// O resto da lógica do componente (useState, useEffect, fetchProdutos) continua a mesma
const ListaProdutos = ({ onEdit, onDeleteRequest, produtos, loading }) => {

  
  if (loading) return <p>Carregando produtos...</p>;

  return (
    // TableContainer com Paper dá um fundo branco e elevação para a tabela
    <TableContainer component={Paper} sx={{ marginTop: 4 }}>
      <Typography variant="h6" component="div" sx={{ padding: '16px' }}>
        Produtos Cadastrados
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="tabela de produtos">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Estoque</TableCell>
            <TableCell>Cód. Barras</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {produtos.map((prod) => (
            <TableRow key={prod.id}>
              <TableCell>{prod.id}</TableCell>
              <TableCell>{prod.nome}</TableCell>
              <TableCell>R$ {Number(prod.preco).toFixed(2)}</TableCell>
              <TableCell>{prod.quantidade_estoque}</TableCell>
              <TableCell>{prod.codigo_barras || 'N/A'}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(prod)} color="primary">
                  <EditIcon />
                </IconButton>
                {/* Chame a nova função onDeleteRequest, passando o ID */}
                <IconButton onClick={() => onDeleteRequest(prod.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListaProdutos;