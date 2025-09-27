// frontend/src/components/Recibo.js
import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material';

const Recibo = React.forwardRef(({ venda }, ref) => {
  if (!venda) {
    return null;
  }

  // ========== CORREÇÃO PRINCIPAL ==========
  // A forma correta de calcular o subtotal é somando o valor de todos os itens.
  const subtotal = venda.VendaItems.reduce((acc, item) => {
    return acc + (Number(item.quantidade) * Number(item.preco_unitario));
  }, 0);
  // ========== FIM DA CORREÇÃO ==========

  const desconto = Number(venda.desconto || 0);
  const valorTotal = Number(venda.valor_total);

  return (
    <Box ref={ref} sx={{ padding: '20px', fontFamily: 'monospace', color: 'black', width: '300px' }}>
      <Typography variant="h6" align="center">PDV - TechPriv</Typography>
      <Typography variant="body2" align="center">Comprovante de Venda</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">Venda ID: {venda.id}</Typography>
      <Typography variant="body2">Data: {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
      <Typography variant="body2">Operador: {venda.Funcionario?.nome || 'N/A'}</Typography>

      {venda.Vendedor && (
        <Typography variant="body2">Vendedor: {venda.Vendedor.nome}</Typography>
      )}
      
      {venda.Cliente && (
        <Typography variant="body2">Cliente: {venda.Cliente.nome}</Typography>
      )}

      <Divider sx={{ my: 2 }} />
      <Table size="small">
        <TableBody>
          {venda.VendaItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell sx={{ border: 'none', padding: '2px' }}>{item.quantidade}x</TableCell>
              <TableCell sx={{ border: 'none', padding: '2px' }}>{item.Produto.nome}</TableCell>
              <TableCell align="right" sx={{ border: 'none', padding: '2px' }}>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">R$ {subtotal.toFixed(2)}</Typography>
        </Box>
        
        {desconto > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">Desconto:</Typography>
            <Typography variant="body1" sx={{ color: 'red' }}>- R$ {desconto.toFixed(2)}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6">TOTAL:</Typography>
            <Typography variant="h6">R$ {valorTotal.toFixed(2)}</Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>Pagamento: {venda.metodo_pagamento}</Typography>
      </Box>

      <Typography variant="caption" align="center" component="p" sx={{ mt: 4 }}>
        Obrigado pela preferência!
      </Typography>
    </Box>
  );
});

export default Recibo;