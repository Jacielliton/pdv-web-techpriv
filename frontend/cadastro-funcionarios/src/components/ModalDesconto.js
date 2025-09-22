// frontend/src/components/ModalDesconto.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography
} from '@mui/material';

const ModalDesconto = ({ open, onClose, onAplicar, subtotal }) => {
  const [valorDesconto, setValorDesconto] = useState('');

  const handleAplicar = () => {
    const valor = parseFloat(valorDesconto);
    if (isNaN(valor) || valor < 0) {
      toast.error('Por favor, insira um valor de desconto válido.');
      return;
    }
    if (valor > subtotal) {
      toast.error('O desconto não pode ser maior que o subtotal da venda.');
      return;
    }
    onAplicar(valor);
    handleClose();
  };

  const handleClose = () => {
    setValorDesconto('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Aplicar Desconto</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Insira o valor do desconto em Reais (R$).
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Valor do Desconto (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={valorDesconto}
          onChange={(e) => setValorDesconto(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAplicar()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleAplicar} variant="contained">Aplicar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDesconto;