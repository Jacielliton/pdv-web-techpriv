// frontend/cadastro-funcionarios/src/components/ModalMovimentacaoCaixa.js
import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Box, CircularProgress, Typography
} from '@mui/material';

// O modal recebe 3 props: se está aberto (open), a função para fechar (onClose), e o tipo (tipo)
const ModalMovimentacaoCaixa = ({ open, onClose, tipo }) => {
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Define textos dinâmicos baseados no tipo de movimentação
  const isSangria = tipo === 'SANGRIA';
  const title = isSangria ? 'Registrar Sangria' : 'Registrar Suprimento';
  const description = isSangria
    ? 'Informe o valor que está sendo retirado do caixa.'
    : 'Informe o valor que está sendo adicionado ao caixa (para troco, por exemplo).';

  const handleSubmit = async () => {
    const valorFloat = parseFloat(valor);
    if (isNaN(valorFloat) || valorFloat <= 0) {
      toast.error('Por favor, insira um valor válido.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/caixa/movimentacao', {
        tipo,
        valor: valorFloat,
        observacao,
      });
      toast.success(`Movimentação (${tipo}) registrada com sucesso!`);
      handleClose(); // Fecha o modal e limpa os campos
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível registrar a movimentação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setValor('');
    setObservacao('');
    onClose(); // Chama a função onClose que veio da página pai
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { p: 2 } }}>
      <DialogTitle>
        <Typography variant="h5" component="p" textAlign="center">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center" sx={{ mb: 3 }}>
          {description}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Valor (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Observação (Opcional)"
          type="text"
          fullWidth
          variant="outlined"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>Cancelar</Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            sx={{ ml: 1 }}
          >
            Confirmar
          </Button>
          {isLoading && (
            <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ModalMovimentacaoCaixa;