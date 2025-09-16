// frontend/src/components/ModalAberturaCaixa.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, CircularProgress, Typography } from '@mui/material';

function ModalAberturaCaixa({ open }) {
  const { abrirCaixa } = useAuth();
  const [valorInicial, setValorInicial] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAbrirCaixa = async () => {
    const valor = parseFloat(valorInicial);
    if (isNaN(valor) || valor < 0) {
      toast.error('Por favor, insira um valor inicial válido.');
      return;
    }

    setIsLoading(true);
    try {
      await abrirCaixa(valor);
      toast.success('Caixa aberto com sucesso!');
      // O modal irá fechar automaticamente pois o status no context vai mudar
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível abrir o caixa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} PaperProps={{ sx: { p: 2 } }}>
      <DialogTitle>
        <Typography variant="h5" component="p" textAlign="center">
          Abertura de Caixa
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center" sx={{ mb: 3 }}>
          Para iniciar as vendas, você precisa abrir o caixa.
          Informe o valor inicial para troco.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="valor_inicial"
          label="Valor Inicial (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={valorInicial}
          onChange={(e) => setValorInicial(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAbrirCaixa();
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Button 
            onClick={handleAbrirCaixa} 
            variant="contained" 
            size="large"
            disabled={isLoading}
            sx={{ px: 5, py: 1.5 }}
          >
            Abrir Caixa
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ModalAberturaCaixa;