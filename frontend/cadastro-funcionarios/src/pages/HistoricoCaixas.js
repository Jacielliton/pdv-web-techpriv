// frontend/cadastro-funcionarios/src/pages/HistoricoCaixas.js (VERSÃO COM FILTROS)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Container, Typography, Paper, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const formatCurrency = (value) => `R$ ${Number(value).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

function HistoricoCaixas() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]); // Para o seletor de funcionários

  // --- ESTADOS DE PAGINAÇÃO E FILTROS ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({ funcionarioId: '', dataInicio: '', dataFim: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

  useEffect(() => {
    // Busca a lista de funcionários para popular o filtro
    const fetchFuncionarios = async () => {
      try {
        // Usamos a API que já existe para listar funcionários (sem paginação para o select)
        const response = await api.get('/funcionarios'); 
        setFuncionarios(response.data.funcionarios || []);
      } catch (error) {
        toast.error('Não foi possível carregar a lista de operadores.');
      }
    };

    const fetchHistorico = async () => {
      setLoading(true);
      try {
        const response = await api.get('/caixas/historico', { params: { page, ...filtrosAtivos } });
        setHistorico(response.data.historico);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error('Não foi possível carregar o histórico de caixas.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFuncionarios();
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
    setFiltros({ funcionarioId: '', dataInicio: '', dataFim: '' });
    setFiltrosAtivos({});
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Fechamentos de Caixa
      </Typography>

      {/* --- PAINEL DE FILTROS --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Operador</InputLabel>
              <Select name="funcionarioId" value={filtros.funcionarioId} label="Operador" onChange={handleFiltroChange}>
                <MenuItem value=""><em>Todos</em></MenuItem>
                {funcionarios.map(func => (
                  <MenuItem key={func.id} value={func.id}>{func.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="dataInicio" label="Data Início" type="date" value={filtros.dataInicio} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="dataFim" label="Data Fim" type="date" value={filtros.dataFim} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Filtrar</Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" onClick={handleLimparFiltros} fullWidth>Limpar Filtros</Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="histórico de caixas">
          <TableHead>
            <TableRow>
              <TableCell>Data Fechamento</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell align="right">Valor Inicial</TableCell>
              <TableCell align="right">Valor Calculado</TableCell>
              <TableCell align="right">Valor Informado</TableCell>
              <TableCell align="right">Diferença</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historico.map((caixa) => (
              <TableRow key={caixa.id}>
                <TableCell>{formatDate(caixa.data_fechamento)}</TableCell>
                <TableCell>{caixa.Funcionario?.nome || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(caixa.valor_inicial)}</TableCell>
                <TableCell align="right">{formatCurrency(caixa.valor_final_calculado)}</TableCell>
                <TableCell align="right">{formatCurrency(caixa.valor_final_informado)}</TableCell>
                <TableCell 
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    color: caixa.diferenca < 0 ? 'error.main' : (caixa.diferenca > 0 ? 'success.main' : 'text.primary')
                  }}
                >
                  {formatCurrency(caixa.diferenca)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Container>
  );
}

export default HistoricoCaixas;