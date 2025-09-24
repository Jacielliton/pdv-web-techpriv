// frontend/src/components/ModalDetalhesProduto.js
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, Typography, Box, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Grid // 1. MOVA O GRID PARA CÁ
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

const ModalDetalhesProduto = ({ open, onClose, produto }) => {
  if (!produto) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Detalhes do Produto: {produto.nome}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Preço de Venda</Typography>
            <Typography variant="h6">{formatCurrency(produto.preco)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Preço de Custo</Typography>
            <Typography variant="h6">{formatCurrency(produto.preco_custo)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Estoque Atual</Typography>
            <Typography variant="h6">{produto.quantidade_estoque} Unidades</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Estoque Mínimo</Typography>
            <Typography variant="h6">{produto.estoque_minimo} Unidades</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" color="text.secondary">Código de Barras</Typography>
            <Typography variant="h6">{produto.codigo_barras || 'Não informado'}</Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Histórico de Entradas no Estoque</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Custo Unitário</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produto.EntradaEstoques?.length > 0 ? (
                produto.EntradaEstoques.map(entrada => (
                  <TableRow key={entrada.id}>
                    <TableCell>{formatDate(entrada.data_entrada)}</TableCell>
                    <TableCell>{entrada.Fornecedor?.nome_fantasia || 'N/A'}</TableCell>
                    <TableCell align="right">{entrada.quantidade}</TableCell>
                    <TableCell align="right">{formatCurrency(entrada.preco_custo_unitario)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">Nenhuma entrada registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetalhesProduto;