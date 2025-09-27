// frontend/src/pages/Relatorios.js (VERSÃO ATUALIZADA)
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Container, Typography, Paper, Box, Grid, TextField, Button, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, IconButton, Tooltip
} from '@mui/material';

// Ícones
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaymentIcon from '@mui/icons-material/Payment';
import CategoryIcon from '@mui/icons-material/Category';


const getISODate = (date) => date.toISOString().split('T')[0];
const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;


const StatCard = ({ title, value, icon, color }) => (
    <Paper 
      elevation={4}
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%', 
        borderLeft: 4, 
        borderColor: `${color}.main`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 6,
        }
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>{title}</Typography>
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      {React.cloneElement(icon, { sx: { fontSize: 40 } })}
    </Paper>
);

const TabVendas = ({ data }) => (
    <Box>
        {/* --- LAYOUT DOS CARDS ATUALIZADO PARA 5 COLUNAS EM TELAS GRANDES --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* NOVO CARD DE FATURAMENTO BRUTO (SUBTOTAL) */}
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <StatCard 
                    title="Faturamento Bruto (Subtotal)" 
                    value={formatCurrency(data.resumo.faturamentoBruto)} 
                    icon={<ReceiptLongIcon color="action" />} 
                    color="primary" 
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <StatCard 
                    title="Total de Descontos" 
                    value={formatCurrency(data.resumo.totalDescontos)} 
                    icon={<LocalOfferIcon color="action" />} 
                    color="error" 
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <StatCard 
                    title="Total Líquido Vendido" 
                    value={formatCurrency(data.resumo.totalVendido)} 
                    icon={<MonetizationOnIcon color="action" />} 
                    color="success" 
                />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={2.4}>
                <StatCard 
                    title="Nº de Vendas" 
                    value={data.resumo.numeroDeVendas} 
                    icon={<PointOfSaleIcon color="action" />} 
                    color="info" 
                />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={2.4}>
                <StatCard 
                    title="Ticket Médio" 
                    value={formatCurrency(data.resumo.ticketMedio)} 
                    icon={<BarChartIcon color="action" />} 
                    color="warning" 
                />
            </Grid>
        </Grid>
        
        <Grid container spacing={3}>
            {/* --- ALTERADO: de 'lg={6}' para 'md={6}' para ativar em telas médias --- */}
            <Grid item xs={12} md={6}>
                <TableContainer component={Paper} elevation={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6">Vendas por Pagamento</Typography>
                  </Box>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.vendasPorMetodo.map(item => ( 
                        <TableRow key={item.metodo_pagamento} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.selected' } }}>
                          <TableCell>{item.metodo_pagamento}</TableCell>
                          <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        </TableRow> 
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            </Grid>
            <Grid item>
                  <TableContainer component={Paper} elevation={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <EmojiEventsIcon sx={{ mr: 1, color: 'goldenrod' }} />
                      <Typography variant="h6">Top 5 Vendedores</Typography>
                    </Box>
                    <Table>
                      <TableHead sx={{ backgroundColor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Vendido</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topVendedores?.map(vendedor => (
                          <TableRow key={vendedor.nome} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.selected' } }}>
                            <TableCell>{vendedor.nome}</TableCell>
                            <TableCell align="right">{formatCurrency(vendedor.totalVendido)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

            {/* --- ALTERADO: de 'lg={6}' para 'md={6}' para ativar em telas médias --- */}
            <Grid item container xs={12} md={6} spacing={3} direction="column">
                <Grid item>
                  <TableContainer component={Paper} elevation={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="h6">Top 10 Produtos</Typography>
                    </Box>
                    <Table>
                      <TableHead sx={{ backgroundColor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.topProdutos.map(item => ( 
                          <TableRow key={item.nome} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.selected' } }}>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell align="right">{item.total_vendido}</TableCell>
                          </TableRow> 
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>               
            </Grid>
        </Grid>
    </Box>
);

// O componente TabLucratividade permanece o mesmo
const TabLucratividade = ({ data }) => (
    <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Faturamento Bruto" value={formatCurrency(data.resumo.faturamentoBruto)} icon={<MonetizationOnIcon color="action" />} color="success" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Custo da Mercadoria" value={formatCurrency(data.resumo.custoTotal)} icon={<ShoppingCartCheckoutIcon color="action" />} color="error" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Lucro Bruto" value={formatCurrency(data.resumo.lucroBruto)} icon={<AttachMoneyIcon color="action" />} color="primary" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Margem de Lucro" value={`${Number(data.resumo.margemLucro || 0).toFixed(2).replace('.', ',')}%`} icon={<TrendingUpIcon color="action" />} color="secondary" /></Grid>
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

// O componente principal Relatorios permanece o mesmo
function Relatorios() {
  const [dataInicio, setDataInicio] = useState(getISODate(new Date(new Date().setDate(1))));
  const [dataFim, setDataFim] = useState(getISODate(new Date()));
  const [relatorioVendas, setRelatorioVendas] = useState(null);
  const [relatorioLucro, setRelatorioLucro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aba, setAba] = useState(0);

  const handleGerarRelatorio = useCallback(async (abaAtual) => {
    setLoading(true);
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
  }, [dataInicio, dataFim]);

  useEffect(() => {
    handleGerarRelatorio(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================================================================
  // FUNÇÃO DE GERAR PDF TOTALMENTE REFEITA
  // ===================================================================
  const handleGerarPDF = async () => {
    setPdfLoading(true);
    
    // Define o endpoint e o nome do arquivo com base na aba ativa
    const isVendas = aba === 0;
    const endpoint = isVendas ? '/relatorios/vendas/pdf' : '/relatorios/lucratividade/pdf';
    const reportName = isVendas ? 'vendas' : 'lucratividade';

    try {
      const response = await api.get(endpoint, {
        params: { data_inicio: dataInicio, data_fim: dataFim },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `relatorio-${reportName}-${dataInicio}-a-${dataFim}.pdf`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast.error('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
      console.error("Erro no download do PDF: ", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setAba(newValue);
    handleGerarRelatorio(newValue);
  };


  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>Relatórios Gerenciais</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={aba} onChange={handleTabChange}>
          <Tab label="Relatório de Vendas" />
          <Tab label="Relatório de Lucratividade" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}><TextField label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={3}><TextField label="Data de Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          
          <Grid item xs={12} sm={6} container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                        <Button variant="contained" onClick={() => handleGerarRelatorio(aba)} disabled={loading} fullWidth sx={{ height: '56px' }}>
                            {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        {/* --- ATUALIZAÇÃO DO BOTÃO DE PDF --- */}
                        <Tooltip title="Gerar Relatório Detalhado em PDF">
                            <span>
                                <IconButton 
                                    color="primary" 
                                    onClick={handleGerarPDF} 
                                    // Agora o botão fica desabilitado apenas durante o loading
                                    disabled={pdfLoading} 
                                    sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '4px', width: '100%', height: '56px' }}
                                >
                                    {pdfLoading ? <CircularProgress size={24} /> : <PictureAsPdfIcon />}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>
        </Grid>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {aba === 0 && relatorioVendas && <TabVendas data={relatorioVendas} />}
      {aba === 1 && relatorioLucro && <TabLucratividade data={relatorioLucro} />}
    </Container>
  );
}


export default Relatorios;