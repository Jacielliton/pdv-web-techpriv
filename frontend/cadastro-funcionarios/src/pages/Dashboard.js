// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ALTERADO: Importa a instância 'api'
import { toast } from 'react-toastify';

// Importando componentes MUI para um visual mais limpo
import { Container, Typography, Grid, Paper, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalVendidoHoje: 0,
    numeroDeVendasHoje: 0,
    topProdutos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // ALTERADO: Usa 'api' e a URL relativa
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (err) {
        console.error("Erro ao buscar resumo do dashboard:", err);
        toast.error("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Gerencial
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Vendido Hoje</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
              R$ {Number(summary.totalVendidoHoje).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Número de Vendas Hoje</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
              {summary.numeroDeVendasHoje}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Top 5 Produtos Mais Vendidos
        </Typography>
        {summary.topProdutos.length === 0 ? (
          <Typography>Nenhum produto vendido hoje.</Typography>
        ) : (
          <List>
            {summary.topProdutos.map(produto => (
              <ListItem key={produto.nome}>
                <ListItemText 
                  primary={produto.nome}
                  secondary={
                    <>
                      <strong>{produto.total_vendido}</strong> unidades vendidas
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;