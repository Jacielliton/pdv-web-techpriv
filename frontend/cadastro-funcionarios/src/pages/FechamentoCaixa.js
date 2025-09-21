// frontend/cadastro-funcionarios/src/pages/FechamentoCaixa.js (VERSÃO COM NOVO DESIGN)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import { 
  Container, Typography, Paper, Box, Grid, TextField, Button, 
  CircularProgress, Divider, Alert, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Helper para formatar moeda
const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

function FechamentoCaixa() {
  const { atualizarCaixaStatus, isManager, signOut } = useAuth();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valorInformado, setValorInformado] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchResumo = async () => {
      try {
        const response = await api.get('/caixa/resumo');
        setResumo(response.data);
      } catch (error) {
        toast.error('Você não tem um caixa aberto para fechar.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchResumo();
  }, [navigate]);

  const { totalEsperadoDinheiro, diferenca } = useMemo(() => {
    if (!resumo) return { totalEsperadoDinheiro: 0, diferenca: 0 };
    const totalDinheiroVendas = resumo.totaisPorPagamento.Dinheiro || 0;
    const valorEsperado = resumo.valor_inicial + totalDinheiroVendas + resumo.totalSuprimentos - resumo.totalSangrias;
    const valorContado = parseFloat(valorInformado) || 0;
    const diff = valorContado - valorEsperado;
    return { totalEsperadoDinheiro: valorEsperado, diferenca: diff };
  }, [resumo, valorInformado]);


  const handleFecharCaixa = async () => {
    if (valorInformado === '' || isNaN(parseFloat(valorInformado))) {
      toast.error('Por favor, informe o valor total contado em dinheiro.');
      return;
    }
    setIsClosing(true);
    try {
      await api.post('/caixa/fechar', { valor_final_informado: parseFloat(valorInformado) });
      toast.success('Caixa fechado com sucesso! Finalizando sessão...');
      await atualizarCaixaStatus();

      setTimeout(() => {
        if (isManager) {
          navigate('/historico-caixas');
        } else {
          signOut();
        }
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível fechar o caixa.');
      setIsClosing(false);
    }
  };

  if (loading || !resumo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- JSX COMPLETAMENTE REDESENHADO ---
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Fechamento de Caixa
      </Typography>

      <Grid container spacing={4}>

        {/* COLUNA DA ESQUERDA: RESUMO DO SISTEMA */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Resumo do Sistema</Typography>
            <List>
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Valor de Abertura (Troco)" secondary={formatCurrency(resumo.valor_inicial)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                <ListItemText primary="Vendas em Dinheiro" secondary={formatCurrency(resumo.totaisPorPagamento.Dinheiro)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Total de Suprimentos" secondary={formatCurrency(resumo.totalSuprimentos)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><ArrowDownwardIcon color="error" /></ListItemIcon>
                <ListItemText primary="Total de Sangrias" secondary={formatCurrency(resumo.totalSangrias)} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="button" color="text.secondary">Total Esperado em Dinheiro</Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalEsperadoDinheiro)}
                </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* COLUNA DA DIREITA: CONFERÊNCIA E AÇÕES */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Conferência Manual</Typography>
            <TextField
              label="Valor Total Contado em Dinheiro"
              type="number"
              fullWidth
              value={valorInformado}
              onChange={(e) => setValorInformado(e.target.value)}
              sx={{ mt: 2, mb: 3 }}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography> }}
              autoFocus
            />

            {valorInformado !== '' && (
              <Alert 
                severity={diferenca < 0 ? 'error' : (diferenca > 0 ? 'warning' : 'success')}
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">
                  Diferença: {formatCurrency(diferenca)}
                  {diferenca < 0 && ' (Quebra de caixa)'}
                  {diferenca > 0 && ' (Sobra de caixa)'}
                  {diferenca === 0 && ' (Caixa correto)'}
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ mt: 'auto', position: 'relative' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleFecharCaixa}
                disabled={isClosing}
                sx={{ p: 1.5 }}
              >
                {isClosing ? <CircularProgress size={26} color="inherit" /> : 'Confirmar Fechamento do Caixa'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FechamentoCaixa;