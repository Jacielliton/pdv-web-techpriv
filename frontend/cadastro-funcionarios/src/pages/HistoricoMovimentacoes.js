// frontend/src/pages/HistoricoMovimentacoes.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Container, Typography, Paper, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';

const formatCurrency = (value) => `R$ ${Number(value).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

function HistoricoMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- 1. ESTADOS PARA CONTROLE DA PAGINAÇÃO ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filtros, setFiltros] = useState({ tipo: '', dataInicio: '', dataFim: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

  const fetchHistorico = useCallback(async () => {
    setLoading(true);
    try {
      // --- 2. ENVIA O NÚMERO DA PÁGINA ATUAL PARA A API ---
      const response = await api.get('/caixas/movimentacoes', { params: { page, ...filtrosAtivos } });
      setMovimentacoes(response.data.movimentacoes);
      // --- 3. RECEBE E ARMAZENA O TOTAL DE PÁGINAS ---
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Não foi possível carregar o histórico de movimentações.');
    } finally {
      setLoading(false);
    }
    // --- 4. O useEffect É REATIVADO QUANDO 'page' OU 'filtrosAtivos' MUDAM ---
  }, [page, filtrosAtivos]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);


  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };
  const handleAplicarFiltros = () => {
    setPage(1); // Volta para a primeira página ao aplicar um novo filtro
    setFiltrosAtivos(filtros);
  };
  const handleLimparFiltros = () => {
    setPage(1);
    setFiltros({ tipo: '', dataInicio: '', dataFim: '' });
    setFiltrosAtivos({});
  };

  // --- 5. FUNÇÃO PARA ATUALIZAR A PÁGINA QUANDO O USUÁRIO CLICA ---
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Sangrias e Suprimentos
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">                
                <Select
                name="tipo"
                value={filtros.tipo}
                label="Tipo" // 1. GARANTE O RECORTE CORRETO NA BORDA
                onChange={handleFiltroChange}
                displayEmpty // 2. PERMITE EXIBIR O PLACEHOLDER
                >
                <MenuItem value="">
                    <em>Todos</em>
                </MenuItem>
                <MenuItem value="SANGRIA">Sangria</MenuItem>
                <MenuItem value="SUPRIMENTO">Suprimento</MenuItem>
                </Select>
            </FormControl>
            </Grid>
          <Grid item xs={12} sm={4}><TextField name="dataInicio" label="Data Início" type="date" value={filtros.dataInicio} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={4}><TextField name="dataFim" label="Data Fim" type="date" value={filtros.dataFim} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Filtrar</Button></Grid>
          <Grid item xs={12} sm={6}><Button variant="outlined" onClick={handleLimparFiltros} fullWidth>Limpar Filtros</Button></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell align="right">Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimentacoes.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell>{formatDate(mov.data_movimentacao)}</TableCell>
                <TableCell>
                  <Chip 
                    label={mov.tipo} 
                    color={mov.tipo === 'SANGRIA' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{mov.observacao || '---'}</TableCell>
                <TableCell>{mov.Funcionario?.nome || 'N/A'}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(mov.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
}

export default HistoricoMovimentacoes;