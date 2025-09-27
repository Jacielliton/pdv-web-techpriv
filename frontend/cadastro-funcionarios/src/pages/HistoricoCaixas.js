// frontend/cadastro-funcionarios/src/pages/HistoricoCaixas.js (VERSÃO CORRIGIDA)

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Container, Typography, Paper, Box, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Pagination, Grid, TextField, Button,
  Select, MenuItem, FormControl, IconButton, Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModalDetalhesCaixa from '../components/ModalDetalhesCaixa';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

function HistoricoCaixas() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({ funcionarioId: '', dataInicio: '', dataFim: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCaixaId, setSelectedCaixaId] = useState(null);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await api.get('/funcionarios');
        setFuncionarios(response.data.funcionarios || []);
      } catch (error) {
        toast.error('Não foi possível carregar a lista de operadores.');
      }
    };
    fetchFuncionarios();
  }, []);

  useEffect(() => {
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
    fetchHistorico();
  }, [page, filtrosAtivos]);

  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  const handleAplicarFiltros = () => { setPage(1); setFiltrosAtivos(filtros); };
  const handleLimparFiltros = () => { setPage(1); setFiltros({ funcionarioId: '', dataInicio: '', dataFim: '' }); setFiltrosAtivos({}); };
  const handlePageChange = (event, value) => setPage(value);
  
  const handleOpenModal = (caixaId) => {
    setSelectedCaixaId(caixaId);
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Fechamentos de Caixa
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <Select name="funcionarioId" value={filtros.funcionarioId} displayEmpty onChange={handleFiltroChange}>
                <MenuItem value=""><em>Todos Operadores</em></MenuItem>
                {funcionarios.map(func => <MenuItem key={func.id} value={func.id}>{func.nome}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}><TextField name="dataInicio" label="Data Início" type="date" value={filtros.dataInicio} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={3}><TextField name="dataFim" label="Data Fim" type="date" value={filtros.dataFim} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={1.5}><Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Filtrar</Button></Grid>
          <Grid item xs={12} sm={1.5}><Button variant="outlined" onClick={handleLimparFiltros} fullWidth>Limpar</Button></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="histórico de caixas">
          <TableHead>
            <TableRow>
              <TableCell>Data Fechamento</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell align="right">Vendas (Dinheiro)</TableCell>
              <TableCell align="right">Vendas (Cartão)</TableCell>
              <TableCell align="right">Vendas (PIX)</TableCell>
              <TableCell align="right">Total Vendas</TableCell>
              <TableCell align="right">Diferença</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historico.map((caixa) => (
              <TableRow key={caixa.id} hover>
                <TableCell>{formatDate(caixa.data_fechamento)}</TableCell>
                <TableCell>{caixa.Funcionario?.nome || 'N/A'}</TableCell>
                
                {/* =================================================================== */}
                {/* CORREÇÃO APLICADA AQUI com o operador '?' (optional chaining)     */}
                {/* =================================================================== */}
                <TableCell align="right">{formatCurrency(caixa.totaisPorPagamento?.Dinheiro)}</TableCell>
                <TableCell align="right">{formatCurrency((caixa.totaisPorPagamento?.['Cartão de Crédito'] || 0) + (caixa.totaisPorPagamento?.['Cartão de Débito'] || 0))}</TableCell>
                <TableCell align="right">{formatCurrency(caixa.totaisPorPagamento?.PIX)}</TableCell>
                {/* =================================================================== */}

                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(caixa.valor_final_calculado)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: caixa.diferenca < 0 ? 'error.main' : (caixa.diferenca > 0 ? 'warning.main' : 'text.primary') }}>
                  {formatCurrency(caixa.diferenca)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver Detalhes">
                    <IconButton onClick={() => handleOpenModal(caixa.id)} size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
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

      <ModalDetalhesCaixa
        open={modalOpen}
        onClose={handleCloseModal}
        caixaId={selectedCaixaId}
      />
    </Container>
  );
}

export default HistoricoCaixas;