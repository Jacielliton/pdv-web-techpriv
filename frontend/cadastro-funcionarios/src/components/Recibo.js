import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material';

// Usamos React.forwardRef para que a biblioteca de impressão possa acessar este componente
const Recibo = React.forwardRef(({ venda }, ref) => {
  if (!venda) {
    return null;
  }

  return (
    <Box ref={ref} sx={{ padding: '20px', fontFamily: 'monospace', color: 'black' }}>
      <Typography variant="h6" align="center">PDV - TechPriv</Typography>
      <Typography variant="body2" align="center">Comprovante de Venda</Typography>
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2">Venda ID: {venda.id}</Typography>
      <Typography variant="body2">Data: {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
      <Typography variant="body2">Operador: {venda.Funcionario?.nome || 'N/A'}</Typography>
      
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

      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="h6">
          TOTAL: R$ {Number(venda.valor_total).toFixed(2)}
        </Typography>
        <Typography variant="body2">
          Pagamento: {venda.metodo_pagamento}
        </Typography>
      </Box>

      <Typography variant="caption" align="center" component="p" sx={{ mt: 4 }}>
        Obrigado pela preferência!
      </Typography>
    </Box>
  );
});

export default Recibo;