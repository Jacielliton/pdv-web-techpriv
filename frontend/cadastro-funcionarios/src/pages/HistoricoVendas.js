import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Grid, Box, CircularProgress, IconButton, Pagination, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'react-toastify';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({ vendaId: '', dataInicio: '', dataFim: '', metodoPagamento: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/vendas', { 
          params: { page, ...filtrosAtivos }
        });
        setVendas(response.data.vendas);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        toast.error("Não foi possível carregar o histórico.");
        setError("Ocorreu um erro ao buscar os dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, [page, filtrosAtivos]);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleAplicarFiltros = () => {
    setPage(1);
    setFiltrosAtivos(filtros);
  };

  const handleLimparFiltros = () => {
    setPage(1);
    setFiltros({ vendaId: '', dataInicio: '', dataFim: '', metodoPagamento: '' });
    setFiltrosAtivos({});
  };
  
  const handlePageChange = (event, value) => { setPage(value); };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>Histórico de Vendas</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* ... Seus campos de filtro ... */}
          <Grid item xs={12} sm={4}><TextField name="vendaId" label="Buscar por ID" value={filtros.vendaId} onChange={handleFiltroChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} sm={4}><TextField name="dataInicio" label="Data Início" type="date" value={filtros.dataInicio} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={4}><TextField name="dataFim" label="Data Fim" type="date" value={filtros.dataFim} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={4}><FormControl fullWidth size="small"><InputLabel>Método Pagto.</InputLabel><Select name="metodoPagamento" value={filtros.metodoPagamento} label="Método Pagto." onChange={handleFiltroChange}><MenuItem value=""><em>Todos</em></MenuItem><MenuItem value="Dinheiro">Dinheiro</MenuItem><MenuItem value="Pix">Pix</MenuItem><MenuItem value="Cartão (PagSeguro)">Cartão (PagSeguro)</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} sm={4}><Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Filtrar</Button></Grid>
          <Grid item xs={12} sm={4}><Button variant="outlined" onClick={handleLimparFiltros} fullWidth>Limpar Filtros</Button></Grid>
        </Grid>
      </Paper>

      {vendas.length === 0 && <Typography>Nenhuma venda encontrada para os filtros selecionados.</Typography>}
      
      {vendas.map(venda => (
        <Accordion key={venda.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography><strong>Venda #{venda.id}</strong> - {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography>Total: <strong>R$ {Number(venda.valor_total).toFixed(2)}</strong></Typography>
                <IconButton 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`/recibo/${venda.id}`, '_blank');
                  }} 
                  color="primary" 
                  sx={{ ml: 2 }}
                >
                  <PrintIcon />
                </IconButton>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
              <Box>
                <Typography variant="subtitle1"><strong>Operador:</strong> {venda.Funcionario?.nome || 'N/A'}</Typography>
                <Typography variant="subtitle1"><strong>Pagamento:</strong> {venda.metodo_pagamento}</Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Itens Vendidos:</Typography>
                <List dense>
                  {venda.VendaItems.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${item.quantidade}x ${item.Produto.nome}`}
                        secondary={`(R$ ${Number(item.preco_unitario).toFixed(2)} cada)`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </AccordionDetails>
        </Accordion>
      ))}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Container>
  );
}

export default HistoricoVendas;