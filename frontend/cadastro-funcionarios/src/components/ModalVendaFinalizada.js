// frontend/cadastro-funcionarios/src/components/ModalVendaFinalizada.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ModalVendaFinalizada = ({ open, onNovaVenda, onImprimirRecibo }) => {
  return (
    <Dialog open={open} PaperProps={{ sx: { p: 2, alignItems: 'center' } }}>
      <DialogTitle>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="p" gutterBottom>
          Venda Finalizada com Sucesso!
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 2 }}>
        <Button onClick={onImprimirRecibo} variant="contained">
          Imprimir Recibo
        </Button>
        <Button onClick={onNovaVenda} variant="outlined">
          Nova Venda
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalVendaFinalizada;