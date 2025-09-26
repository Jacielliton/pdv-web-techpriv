// frontend/src/components/ModalSelecionarVendedor.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, ListItemButton, CircularProgress, Typography, Box } from '@mui/material';

const ModalSelecionarVendedor = ({ open, onClose, onVendedorSelecionado }) => {
  const [vendedores, setVendedores] = useState([]);
  const [todosVendedores, setTodosVendedores] = useState([]); // Armazena a lista completa
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(false);

  // Efeito para buscar todos os vendedores uma vez quando o modal abrir
  useEffect(() => {
    if (open) {
      const fetchVendedores = async () => {
        setLoading(true);
        try {
          const response = await api.get('/funcionarios');
          const listaVendedores = response.data.funcionarios || [];
          setTodosVendedores(listaVendedores);
          setVendedores(listaVendedores); // Inicialmente, mostra todos
        } catch (error) {
          console.error("Erro ao buscar vendedores", error);
          setTodosVendedores([]);
          setVendedores([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVendedores();
    }
  }, [open]);

  // Efeito para filtrar a lista localmente conforme o usuário digita
  useEffect(() => {
    if (termoBusca === '') {
      setVendedores(todosVendedores);
    } else {
      setVendedores(
        todosVendedores.filter(v =>
          v.nome.toLowerCase().includes(termoBusca.toLowerCase())
        )
      );
    }
  }, [termoBusca, todosVendedores]);


  const handleSelect = (vendedor) => {
    onVendedorSelecionado(vendedor);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selecionar Vendedor</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Buscar vendedor por nome"
          fullWidth
          variant="outlined"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          sx={{ mb: 2 }}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {vendedores.length > 0 ? vendedores.map(vendedor => (
              <ListItem key={vendedor.id} disablePadding>
                <ListItemButton onClick={() => handleSelect(vendedor)}>
                  <ListItemText primary={vendedor.nome} secondary={vendedor.cargo} />
                </ListItemButton>
              </ListItem>
            )) : (
              <Typography sx={{ textAlign: 'center', p: 2 }}>Nenhum vendedor encontrado.</Typography>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelecionarVendedor;