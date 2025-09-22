// frontend/src/components/ModalSelecionarCliente.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, ListItemButton, CircularProgress } from '@mui/material';

const ModalSelecionarCliente = ({ open, onClose, onClienteSelecionado }) => {
  const [clientes, setClientes] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchClientes = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/clientes?nome=${termoBusca}`);
          setClientes(response.data);
        } catch (error) {
          console.error("Erro ao buscar clientes", error);
        } finally {
          setLoading(false);
        }
      };
      
      // Debounce: espera 300ms após o usuário parar de digitar para fazer a busca
      const timerId = setTimeout(fetchClientes, 300);
      return () => clearTimeout(timerId);
    }
  }, [termoBusca, open]);

  const handleSelect = (cliente) => {
    onClienteSelecionado(cliente);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecionar Cliente</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Buscar cliente por nome"
          fullWidth
          variant="outlined"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          sx={{ mb: 2 }}
        />
        {loading ? <CircularProgress /> : (
          <List>
            {clientes.map(cliente => (
              <ListItem key={cliente.id} disablePadding>
                <ListItemButton onClick={() => handleSelect(cliente)}>
                  <ListItemText primary={cliente.nome} secondary={cliente.cpf} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelecionarCliente;