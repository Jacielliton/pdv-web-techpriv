// frontend/cadastro-funcionarios/src/components/PrintController.js
import React, { useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material';

// O componente do Recibo agora vive dentro do PrintController
const ReciboParaImprimir = React.forwardRef(({ venda }, ref) => {
  return (
    <Box ref={ref} sx={{ padding: '20px', fontFamily: 'monospace', color: 'black' }}>
      {venda && (
        <>
          <Typography variant="h6" align="center">PDV - TechPriv</Typography>
          <Typography variant="body2" align="center">Comprovante de Venda</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">Venda ID: {venda.id}</Typography>
          <Typography variant="body2">Data: {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
          <Typography variant="body2">Operador: {venda.Funcionario?.nome || 'N/A'}</Typography>
          <Divider sx={{ my: 2 }} />
          <Table size="small">
            <TableBody>
              {venda.VendaItems && venda.VendaItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: 'none', padding: '2px' }}>{item.quantidade}x</TableCell>
                  <TableCell sx={{ border: 'none', padding: '2px' }}>{item.Produto?.nome || '-'}</TableCell>
                  <TableCell align="right" sx={{ border: 'none', padding: '2px' }}>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6">TOTAL: R$ {Number(venda.valor_total).toFixed(2)}</Typography>
            <Typography variant="body2">Pagamento: {venda.metodo_pagamento}</Typography>
          </Box>
          <Typography variant="caption" align="center" component="p" sx={{ mt: 4 }}>Obrigado!</Typography>
        </>
      )}
    </Box>
  );
});

// O Controller que gerencia a impressão
const PrintController = ({ venda, onPrintFinished }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => onPrintFinished(), // Avisa o componente pai que a impressão terminou
  });

  useEffect(() => {
    // Assim que este componente é montado, a impressão é acionada
    handlePrint();
  }, [handlePrint]);

  // Este componente renderiza o recibo de forma invisível
  return (
    <div style={{ display: 'none' }}>
      <ReciboParaImprimir ref={componentRef} venda={venda} />
    </div>
  );
};

export default PrintController;