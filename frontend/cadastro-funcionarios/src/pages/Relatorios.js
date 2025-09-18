// frontend/src/pages/Relatorios.js
import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Container, Typography, Paper, Box, Grid, TextField, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Função para formatar a data para o formato YYYY-MM-DD que o input type="date" precisa
const getISODate = (date) => date.toISOString().split('T')[0];

function Relatorios() {
  const [dataInicio, setDataInicio] = useState(getISODate(new Date(new Date().setDate(1)))); // Primeiro dia do mês atual
  const [dataFim, setDataFim] = useState(getISODate(new Date())); // Dia atual
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

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              label="Data de Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Data de Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={handleGerarRelatorio} disabled={loading} fullWidth sx={{ height: '56px' }}>
              {loading ? <CircularProgress size={24} /> : 'Gerar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {relatorio && (
        <Grid container spacing={3}>
          {/* Resumo Geral */}
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total Vendido</Typography><Typography variant="h4">R$ {relatorio.resumo.totalVendido.toFixed(2)}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Nº de Vendas</Typography><Typography variant="h4">{relatorio.resumo.numeroDeVendas}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Ticket Médio</Typography><Typography variant="h4">R$ {relatorio.resumo.ticketMedio.toFixed(2)}</Typography></Paper></Grid>
          
          {/* Tabelas de Detalhes */}
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Typography variant="h6" sx={{ p: 2 }}>Vendas por Método de Pagamento</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Método</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
                <TableBody>
                  {relatorio.vendasPorMetodo.map(item => (
                    <TableRow key={item.metodo_pagamento}><TableCell>{item.metodo_pagamento}</TableCell><TableCell align="right">R$ {Number(item.total).toFixed(2)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Typography variant="h6" sx={{ p: 2 }}>Top 10 Produtos Vendidos</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Produto</TableCell><TableCell align="right">Qtd.</TableCell></TableRow></TableHead>
                <TableBody>
                  {relatorio.topProdutos.map(item => (
                    <TableRow key={item.nome}><TableCell>{item.nome}</TableCell><TableCell align="right">{item.total_vendido}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Relatorios;