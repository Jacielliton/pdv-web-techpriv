// frontend/src/components/LowStockProducts.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Paper, Typography, List, ListItem, ListItemText, Box, Divider, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const LowStockProducts = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const response = await api.get('/dashboard/low-stock');
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos com estoque baixo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <WarningIcon color="warning" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h3">
          Alerta de Estoque Baixo
        </Typography>
      </Box>
      <Divider />
      {produtos.length === 0 ? (
        <Typography sx={{ pt: 4, textAlign: 'center' }}>Nenhum produto com estoque baixo.</Typography>
      ) : (
        <List>
          {produtos.map(produto => (
            <ListItem key={produto.id} divider>
              <ListItemText
                primary={produto.nome}
                secondary={`Estoque Atual: ${produto.quantidade_estoque} (Mínimo: ${produto.estoque_minimo})`}
                secondaryTypographyProps={{ color: 'error.main', fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default LowStockProducts;