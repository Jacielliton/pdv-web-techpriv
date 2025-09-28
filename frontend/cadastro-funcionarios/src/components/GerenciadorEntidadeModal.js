// frontend/src/components/GerenciadorEntidadeModal.js (NOVO ARQUIVO)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, IconButton, TextField, Box, CircularProgress, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const GerenciadorEntidadeModal = ({ open, onClose, tipo, onSuccess }) => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState('');

  const plural = tipo === 'Grupo' ? 'grupos' : 'categorias';
  const singular = tipo === 'Grupo' ? 'grupo' : 'categoria';

  const fetchItens = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/${plural}`);
      setItens(response.data);
    } catch (error) {
      toast.error(`Erro ao carregar ${plural}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchItens();
    }
  }, [open, plural]);

  const handleAdicionar = async () => {
    if (!novoItemNome.trim()) {
      toast.warn(`O nome do ${singular} não pode ser vazio.`);
      return;
    }
    setLoading(true);
    try {
      await api.post(`/${plural}`, { nome: novoItemNome });
      toast.success(`${tipo} adicionado com sucesso!`);
      setNovoItemNome('');
      await fetchItens(); // Recarrega a lista
      if (onSuccess) onSuccess(); // Notifica o componente pai para recarregar
    } catch (error) {
      toast.error(error.response?.data?.error || `Erro ao adicionar ${singular}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${singular}?`)) return;
    setLoading(true);
    try {
      await api.delete(`/${plural}/${id}`);
      toast.success(`${tipo} excluído com sucesso!`);
      await fetchItens();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || `Erro ao excluir ${singular}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Gerenciar {tipo}s</DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        
        {!loading && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label={`Novo ${singular}`}
                value={novoItemNome}
                onChange={(e) => setNovoItemNome(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdicionar()}
                fullWidth
                size="small"
              />
              <Button onClick={handleAdicionar} variant="contained" startIcon={<AddIcon />}>
                Adicionar
              </Button>
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {itens.length > 0 ? itens.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeletar(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={item.nome} />
                </ListItem>
              )) : (
                <Typography color="text.secondary" align="center">Nenhum {singular} cadastrado.</Typography>
              )}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GerenciadorEntidadeModal;