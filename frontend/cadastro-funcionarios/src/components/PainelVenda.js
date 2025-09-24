// frontend/src/components/PainelVenda.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Box, IconButton, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Button, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// 1. ENVOLVEMOS O COMPONENTE COM React.forwardRef
const PainelVenda = React.forwardRef(({
  carrinho, subtotal, desconto, totalVenda, clienteSelecionado, lastAddedId,
  onQuantidadeChange, onRemoverDoCarrinho, onFinalizarVenda, onAbrirModalMovimentacao,
  onAbrirModalCliente, onRemoverCliente, onAbrirModalDesconto, onRemoverDesconto
}, ref) => { // 2. RECEBEMOS A 'ref' COMO SEGUNDO ARGUMENTO
  // Estados locais apenas para controle de UI deste componente
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);

  // Efeito para calcular o troco
  useEffect(() => {
    const valorPagoFloat = parseFloat(valorPago);
    if (metodoPagamento === 'Dinheiro' && !isNaN(valorPagoFloat) && valorPagoFloat >= totalVenda) {
      setTroco(valorPagoFloat - totalVenda);
    } else {
      setTroco(0);
    }
  }, [valorPago, totalVenda, metodoPagamento]);

  // Limpa campos locais quando o carrinho muda
  useEffect(() => {
    setValorPago('');
  }, [carrinho]);

  const handleFinalizar = () => {
    onFinalizarVenda(metodoPagamento, valorPago);
  };

  return (
    <Paper sx={{ flex: 5, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 32px)' }}>
      {/* Título e Tabela de Itens (sem alterações) */}
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
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
        {/* Mostra o Subtotal e Desconto se houver desconto aplicado */}
        {desconto > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal</Typography>
              <Typography>R$ {subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
              <Typography color="inherit">Desconto</Typography>
              <Typography color="inherit">- R$ {desconto.toFixed(2)}</Typography>
            </Box>
          </>
        )}
        
        {/* Total da Venda */}
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
            label="Valor Pago (F8)" 
            type="number" 
            fullWidth 
            value={valorPago} 
            onChange={(e) => setValorPago(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            // 3. CONECTAMOS A REF AO INPUT INTERNO DO TEXTFIELD
            inputRef={ref}
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
          <Button variant="outlined" fullWidth onClick={() => onAbrirModalMovimentacao('SANGRIA')}>Sangria</Button>
          <Button variant="outlined" fullWidth onClick={() => onAbrirModalMovimentacao('SUPRIMENTO')}>Suprimento</Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="secondary" fullWidth onClick={onAbrirModalDesconto}>Aplicar Desconto</Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={onRemoverDesconto} disabled={desconto === 0}>Remover Desconto</Button>
        </Stack>
        
        {clienteSelecionado ? (
          <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2">Cliente: {clienteSelecionado.nome}</Typography>
            <Button size="small" onClick={onRemoverCliente}>Remover Cliente</Button>
          </Box>
        ) : (
          <Button variant="outlined" fullWidth onClick={onAbrirModalCliente}>Associar Cliente</Button>
        )}

        <Button
          variant="contained" color="success" size="large" onClick={handleFinalizar}
          disabled={carrinho.length === 0}
          sx={{ p: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Finalizar Venda
        </Button>
      </Box>
    </Paper>
  );
});

export default PainelVenda;