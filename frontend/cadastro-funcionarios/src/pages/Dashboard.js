import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Container, Typography, Grid, Paper, CircularProgress, List, ListItem, ListItemText, Box, Divider, Avatar, ListItemIcon } from '@mui/material';
import GraficoVendas from '../components/GraficoVendas';
import LowStockProducts from '../components/LowStockProducts';

// --- Ícones para os cards ---
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';

// --- Componente para os cards de resumo ---
const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

function Dashboard() {
  const [summary, setSummary] = useState({
    totalVendidoHoje: 0,
    numeroDeVendasHoje: 0,
    ticketMedioHoje: 0, // Adicionaremos este dado no futuro
    topProdutos: [],
  });
  const [vendasSemanais, setVendasSemanais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, vendasSemanaisResponse] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/vendas-semanais')
        ]);
        
        setSummary(summaryResponse.data);
        setVendasSemanais(vendasSemanaisResponse.data);
      } catch (err) {
        toast.error("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard Gerencial
      </Typography>      

      {/* Cards de Resumo */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Total Vendido Hoje"
            value={`R$ ${Number(summary.totalVendidoHoje).toFixed(2)}`}
            icon={<MonetizationOnIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Vendas Realizadas Hoje"
            value={summary.numeroDeVendasHoje}
            icon={<PointOfSaleIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
           <StatCard 
            title="Ticket Médio Hoje"
            value={`R$ ${Number(summary.ticketMedioHoje || 0).toFixed(2)}`}
            icon={<BarChartIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Gráfico e Top Produtos lado a lado */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" component="h3" gutterBottom>
              Vendas nos Últimos 7 Dias
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <GraficoVendas data={vendasSemanais} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" component="h3" gutterBottom>
              Top 5 Produtos Mais Vendidos
            </Typography>
            {summary.topProdutos.length === 0 ? (
              <Typography sx={{ pt: 4, textAlign: 'center' }}>Nenhum produto vendido hoje.</Typography>
            ) : (
              <List>
                {summary.topProdutos.map((produto, index) => (
                  <React.Fragment key={produto.nome}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{index + 1}</Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={produto.nome}
                        secondary={`${produto.total_vendido} unidades vendidas`}
                      />
                    </ListItem>
                    {index < summary.topProdutos.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <LowStockProducts />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;