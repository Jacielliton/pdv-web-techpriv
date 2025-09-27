// frontend/src/components/ManagerOverrideDialog.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';

// ========== INÍCIO DA ALTERAÇÃO ==========
// Adicionamos a prop 'description' para customizar a mensagem
const ManagerOverrideDialog = ({ open, onClose, onConfirm, error, description }) => {
// ========== FIM DA ALTERAÇÃO ==========
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(email, password);
  };

  // Efeito para limpar os campos quando o modal for fechado
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Autorização de Gerente Requerida</DialogTitle>
      <DialogContent>
        {/* ========== INÍCIO DA ALTERAÇÃO ========== */}
        {/* Usamos a prop 'description' ou um texto padrão */}
        <Typography variant="body2" gutterBottom>
          {description || 'Esta ação requer credenciais de um gerente.'}
        </Typography>
        {/* ========== FIM DA ALTERAÇÃO ========== */}
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="E-mail do Gerente"
          type="email"
          fullWidth
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          id="password"
          label="Senha do Gerente"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
        />
        {error && <Typography color="error" variant="caption">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained">Autorizar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagerOverrideDialog;