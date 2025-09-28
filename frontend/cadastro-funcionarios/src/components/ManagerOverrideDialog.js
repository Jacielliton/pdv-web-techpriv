// frontend/src/components/ManagerOverrideDialog.js (VERSÃO ATUALIZADA)
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, CircularProgress } from '@mui/material';

// O onConfirm agora espera o objeto do funcionário autorizado
const ManagerOverrideDialog = ({ open, onClose, onConfirm, description }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // Chama a função onConfirm (que fará a chamada da API) e passa os dados
      await onConfirm(email, senha);
      // O fechamento do modal será controlado pelo componente pai (FrenteDeCaixa)
    } catch (err) {
      // Se onConfirm lançar um erro, ele será capturado aqui
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setEmail('');
      setSenha('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      {/* ALTERAÇÃO: Título e descrição mais genéricos */}
      <DialogTitle>Autorização Requerida</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          {description || 'Esta ação requer permissão de Supervisor ou Gerente.'}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="E-mail do Supervisor/Gerente"
          type="email"
          fullWidth
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <TextField
          margin="dense"
          id="senha"
          label="Senha"
          type="password"
          fullWidth
          variant="standard"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
          disabled={loading}
        />
        {error && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Autorizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagerOverrideDialog;