// frontend/src/components/SelecaoEntidadeModal.js (NOVO ARQUIVO)
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemButton, ListItemText, Box, Typography } from '@mui/material';

const SelecaoEntidadeModal = ({ open, onClose, tipo, itens, onSelecionar }) => {
  const [termoBusca, setTermoBusca] = useState('');

  // Limpa a busca quando o modal é fechado ou o tipo muda
  useEffect(() => {
    if (open) {
      setTermoBusca('');
    }
  }, [open]);

  // Filtra os itens com base na busca do usuário
  const itensFiltrados = useMemo(() => {
    if (!termoBusca.trim()) {
      return itens;
    }
    return itens.filter(item =>
      item.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [itens, termoBusca]);

  const handleSelecionar = (item) => {
    onSelecionar(item);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Selecionar {tipo}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={`Buscar ${tipo}...`}
          type="text"
          fullWidth
          variant="outlined"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ height: '300px', overflowY: 'auto' }}>
          <List>
            {itensFiltrados.length > 0 ? (
              itensFiltrados.map(item => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => handleSelecionar(item)}>
                    <ListItemText primary={item.nome} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Nenhum resultado encontrado.
              </Typography>
            )}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SelecaoEntidadeModal;