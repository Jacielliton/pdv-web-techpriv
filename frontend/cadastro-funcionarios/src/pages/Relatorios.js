// frontend/src/pages/Relatorios.js (VERSÃO FINAL COM ABAS)
import React, { useState, useEffect, useCallback } from 'react'; // Adicione useCallback
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Container, Typography, Paper, Box, Grid, TextField, Button, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab 
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const getISODate = (date) => date.toISOString().split('T')[0];
const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

// Componente para os cards de estatísticas
const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%', borderLeft: 4, borderColor: `${color}.main` }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      {icon}
    </Paper>
);

// Componente que renderiza o conteúdo da aba de Vendas
const TabVendas = ({ data }) => (
    <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}><StatCard title="Total Vendido" value={formatCurrency(data.resumo.totalVendido)} icon={<MonetizationOnIcon color="action" />} color="success" /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Nº de Vendas" value={data.resumo.numeroDeVendas} icon={<PointOfSaleIcon color="action" />} color="info" /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Ticket Médio" value={formatCurrency(data.resumo.ticketMedio)} icon={<BarChartIcon color="action" />} color="warning" /></Grid>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <TableContainer component={Paper}><Typography variant="h6" sx={{ p: 2 }}>Vendas por Pagamento</Typography><Table><TableHead><TableRow><TableCell>Método</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead><TableBody>{data.vendasPorMetodo.map(item => ( <TableRow key={item.metodo_pagamento} hover><TableCell>{item.metodo_pagamento}</TableCell><TableCell align="right">{formatCurrency(item.total)}</TableCell></TableRow> ))}</TableBody></Table></TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
                <TableContainer component={Paper}><Typography variant="h6" sx={{ p: 2 }}>Top 10 Produtos Vendidos</Typography><Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead><TableBody>{data.topProdutos.map(item => ( <TableRow key={item.nome} hover><TableCell>{item.nome}</TableCell><TableCell align="right">{item.total_vendido}</TableCell></TableRow> ))}</TableBody></Table></TableContainer>
            </Grid>
        </Grid>
    </Box>
);

// Componente que renderiza o conteúdo da aba de Lucratividade
const TabLucratividade = ({ data }) => (
    <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Faturamento Bruto" value={formatCurrency(data.resumo.faturamentoBruto)} icon={<MonetizationOnIcon color="action" />} color="success" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Custo da Mercadoria" value={formatCurrency(data.resumo.custoTotal)} icon={<ShoppingCartCheckoutIcon color="action" />} color="error" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Lucro Bruto" value={formatCurrency(data.resumo.lucroBruto)} icon={<AttachMoneyIcon color="action" />} color="primary" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Margem de Lucro" value={`${data.resumo.margemLucro.toFixed(2)}%`} icon={<TrendingUpIcon color="action" />} color="secondary" /></Grid>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <TableContainer component={Paper}><Typography variant="h6" sx={{ p: 2 }}>Top 5 Produtos Mais Lucrativos</Typography><Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell align="right">Lucro Total</TableCell></TableRow></TableHead><TableBody>{data.top5MaisLucrativos.map(item => ( <TableRow key={item.nome} hover><TableCell>{item.nome}</TableCell><TableCell align="right">{formatCurrency(item.lucroTotal)}</TableCell></TableRow> ))}</TableBody></Table></TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
                <TableContainer component={Paper}><Typography variant="h6" sx={{ p: 2 }}>Top 5 Produtos Menos Lucrativos</Typography><Table><TableHead><TableRow><TableCell>Produto</TableCell><TableCell align="right">Lucro Total</TableCell></TableRow></TableHead><TableBody>{data.top5MenosLucrativos.map(item => ( <TableRow key={item.nome} hover><TableCell>{item.nome}</TableCell><TableCell align="right">{formatCurrency(item.lucroTotal)}</TableCell></TableRow> ))}</TableBody></Table></TableContainer>
            </Grid>
        </Grid>
    </Box>
);

function Relatorios() {
  const [dataInicio, setDataInicio] = useState(getISODate(new Date(new Date().setDate(1))));
  const [dataFim, setDataFim] = useState(getISODate(new Date()));
  const [relatorioVendas, setRelatorioVendas] = useState(null);
  const [relatorioLucro, setRelatorioLucro] = useState(null);
  const [loading, setLoading] = useState(true); // Inicia como true para o carregamento inicial
  const [aba, setAba] = useState(0);

  // O useCallback otimiza a função para que ela não seja recriada desnecessariamente
  const handleGerarRelatorio = useCallback(async (abaAtual) => {
    setLoading(true);
    // Limpa apenas o relatório que será recarregado
    if (abaAtual === 0) setRelatorioVendas(null);
    else setRelatorioLucro(null);
    
    try {
      const endpoint = abaAtual === 0 ? '/relatorios/vendas' : '/relatorios/lucratividade';
      const response = await api.get(endpoint, { params: { data_inicio: dataInicio, data_fim: dataFim } });
      if (abaAtual === 0) setRelatorioVendas(response.data);
      else setRelatorioLucro(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível gerar o relatório.');
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]); // A função depende das datas para buscar os dados corretos

  // 1. MELHORIA: CARREGA O RELATÓRIO DE VENDAS AO ABRIR A PÁGINA
  useEffect(() => {
    handleGerarRelatorio(0); // Chama o relatório da aba 0 (Vendas)
  }, []); // O array vazio [] garante que isso rode apenas uma vez, quando a página carrega

  // 2. MELHORIA: GERA O NOVO RELATÓRIO AUTOMATICAMENTE AO MUDAR DE ABA
  const handleTabChange = (event, newValue) => {
    setAba(newValue);
    handleGerarRelatorio(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>Relatórios Gerenciais</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={aba} onChange={handleTabChange}> {/* Usa a nova função */}
          <Tab label="Relatório de Vendas" />
          <Tab label="Relatório de Lucratividade" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}><TextField label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Data de Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          {/* O botão agora chama a função passando a aba atual */}
          <Grid item xs={12} sm={4}><Button variant="contained" onClick={() => handleGerarRelatorio(aba)} disabled={loading} fullWidth sx={{ height: '56px' }}>{loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}</Button></Grid>
        </Grid>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* A lógica de renderização continua a mesma e funciona perfeitamente */}
      {aba === 0 && relatorioVendas && <TabVendas data={relatorioVendas} />}
      {aba === 1 && relatorioLucro && <TabLucratividade data={relatorioLucro} />}
    </Container>
  );
}

export default Relatorios;