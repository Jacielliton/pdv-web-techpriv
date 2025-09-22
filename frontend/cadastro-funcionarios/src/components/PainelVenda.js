// frontend/src/components/PainelVenda.js

import React, { useState, useMemo, useEffect } from 'react';
import {
  Paper, Typography, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Box, IconButton, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Button, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const PainelVenda = ({
  carrinho,
  lastAddedId,
  onQuantidadeChange,
  onRemoverDoCarrinho,
  onFinalizarVenda,
  onAbrirModalMovimentacao,
}) => {
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);

  const totalVenda = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }, [carrinho]);

  useEffect(() => {
    const valorPagoFloat = parseFloat(valorPago);
    if (!isNaN(valorPagoFloat) && valorPagoFloat >= totalVenda) {
      setTroco(valorPagoFloat - totalVenda);
    } else {
      setTroco(0);
    }
  }, [valorPago, totalVenda]);

  // Limpa o valor pago quando o carrinho ou método de pagamento muda
  useEffect(() => {
    setValorPago('');
  }, [carrinho, metodoPagamento]);

  return (
    <Paper sx={{ flex: 5, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 32px)' }}>
      <Typography variant="h5" sx={{ p: 2, pb: 1 }}>Itens da Venda</Typography>
      <Divider />
      <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="center" sx={{ width: '130px' }}>Qtd.</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="center">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carrinho.length > 0 ? carrinho.map(item => (
              <TableRow key={item.id} sx={{ animation: lastAddedId === item.id ? 'highlight-add 0.5s ease-out' : 'none' }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">R$ {Number(item.preco).toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => onQuantidadeChange(item.id, item.quantidade - 1)}>
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.quantidade}</Typography>
                    <IconButton size="small" onClick={() => onQuantidadeChange(item.id, item.quantidade + 1)}>
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium' }}>R$ {(item.quantidade * item.preco).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error" onClick={() => onRemoverDoCarrinho(item.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>Carrinho vazio</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="h5">Total</Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            R$ {totalVenda.toFixed(2)}
          </Typography>
        </Box>
      
        <FormControl fullWidth>
          <InputLabel>Método de Pagamento</InputLabel>
          <Select value={metodoPagamento} label="Método de Pagamento" onChange={e => setMetodoPagamento(e.target.value)}>
            <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
            <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
            <MenuItem value="Pix">Pix</MenuItem>
          </Select>
        </FormControl>            
      
        {metodoPagamento === 'Dinheiro' && (
          <TextField 
            label="Valor Pago" type="number" fullWidth value={valorPago} onChange={(e) => setValorPago(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          />
        )}
        
        {troco > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h6">Troco</Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              R$ {troco.toFixed(2)}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" fullWidth onClick={() => onAbrirModalMovimentacao('SANGRIA')}>
            Registrar Sangria
          </Button>
          <Button variant="outlined" fullWidth onClick={() => onAbrirModalMovimentacao('SUPRIMENTO')}>
            Registrar Suprimento
          </Button>
        </Stack>

        <Button
          variant="contained" color="success" size="large" onClick={() => onFinalizarVenda(metodoPagamento, totalVenda)}
          disabled={carrinho.length === 0}
          sx={{ p: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Finalizar Venda
        </Button>
      </Box>
    </Paper>
  );
};

export default PainelVenda;