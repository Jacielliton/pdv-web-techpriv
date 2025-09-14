import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';

const ManagerOverrideDialog = ({ open, onClose, onConfirm, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(email, password);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Autorização de Gerente Requerida</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Para remover este item, por favor, insira as credenciais de um gerente.
        </Typography>
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