import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Container, Typography, Paper, Box, Grid, TextField, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';

const getISODate = (date) => date.toISOString().split('T')[0];

const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%', borderLeft: 4, borderColor: `${color}.main` }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      {icon}
    </Paper>
);

function Relatorios() {
  const [dataInicio, setDataInicio] = useState(getISODate(new Date(new Date().setDate(1))));
  const [dataFim, setDataFim] = useState(getISODate(new Date()));
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGerarRelatorio = async () => {
    setLoading(true);
    setRelatorio(null);
    try {
      const response = await api.get('/relatorios/vendas', {
        params: { data_inicio: dataInicio, data_fim: dataFim }
      });
      setRelatorio(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível gerar o relatório.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Relatório de Vendas
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Data de Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={handleGerarRelatorio} disabled={loading} fullWidth sx={{ height: '56px' }}>
              {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}

      {relatorio && (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Resumo do Período</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}><StatCard title="Total Vendido" value={`R$ ${relatorio.resumo.totalVendido.toFixed(2)}`} icon={<MonetizationOnIcon color="action" />} color="success" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Nº de Vendas" value={relatorio.resumo.numeroDeVendas} icon={<PointOfSaleIcon color="action" />} color="info" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Ticket Médio" value={`R$ ${relatorio.resumo.ticketMedio.toFixed(2)}`} icon={<BarChartIcon color="action" />} color="warning" /></Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                    <Typography variant="h6" sx={{ p: 2 }}>Vendas por Método de Pagamento</Typography>
                    <Table>
                        <TableHead><TableRow><TableCell>Método</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
                        <TableBody>
                        {relatorio.vendasPorMetodo.map(item => (
                            <TableRow key={item.metodo_pagamento} hover><TableCell>{item.metodo_pagamento}</TableCell><TableCell align="right">R$ {Number(item.total).toFixed(2)}</TableCell></TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                    <Typography variant="h6" sx={{ p: 2 }}>Top 10 Produtos Vendidos</Typography>
                    <Table>
                        <TableHead><TableRow><TableCell>Produto</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead>
                        <TableBody>
                        {relatorio.topProdutos.map(item => (
                            <TableRow key={item.nome} hover><TableCell>{item.nome}</TableCell><TableCell align="right">{item.total_vendido}</TableCell></TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
      )}
    </Container>
  );
}

export default Relatorios;