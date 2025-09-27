// frontend/cadastro-funcionarios/src/pages/FechamentoCaixa.js (VERSÃO CORRIGIDA)

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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

function FechamentoCaixa() {
  const { atualizarCaixaStatus, isManager, signOut } = useAuth();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valorInformado, setValorInformado] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [debouncedValorInformado, setDebouncedValorInformado] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValorInformado(valorInformado);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [valorInformado]);

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

  const totalEsperadoDinheiro = useMemo(() => {
    if (!resumo) return 0;
    
    const vendasDinheiro = resumo.vendasPorMetodo?.Dinheiro || 0;
    const pagamentosDinheiro = resumo.pagamentosDeContasPorMetodo?.Dinheiro || 0;
    
    return resumo.valor_inicial + vendasDinheiro + pagamentosDinheiro + resumo.totalSuprimentos - resumo.totalSangrias;
  }, [resumo]);

  const diferenca = useMemo(() => {
    const valorContado = parseFloat(debouncedValorInformado) || 0;
    return valorContado - totalEsperadoDinheiro;
  }, [debouncedValorInformado, totalEsperadoDinheiro]);

  // MOVIDO PARA CIMA: Para seguir a Regra dos Hooks, este useMemo deve vir antes de qualquer retorno condicional.
  const todosMetodos = useMemo(() => {
    if (!resumo) return []; // Retorna um array vazio se o resumo ainda não chegou
    
    const metodos = new Set([
      ...Object.keys(resumo.vendasPorMetodo || {}),
      ...Object.keys(resumo.pagamentosDeContasPorMetodo || {})
    ]);
    return Array.from(metodos);
  }, [resumo]);

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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Fechamento de Caixa
      </Typography>

      <Grid container spacing={4}>
        {/* PAINEL DA ESQUERDA: RESUMO DE DINHEIRO */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Resumo do Sistema (em Dinheiro)</Typography>
            <List>
              {/* ENTRADAS DE DINHEIRO */}
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Valor de Abertura (Troco)" secondary={formatCurrency(resumo.valor_inicial)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                <ListItemText primary="Vendas em Dinheiro" secondary={formatCurrency(resumo.vendasPorMetodo.Dinheiro)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><ReceiptLongIcon color="success" /></ListItemIcon>
                <ListItemText primary="Pagamentos de Contas (Dinheiro)" secondary={formatCurrency(resumo.pagamentosDeContasPorMetodo.Dinheiro)} />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Total de Suprimentos" secondary={formatCurrency(resumo.totalSuprimentos)} />
              </ListItem>              
              {/* SAÍDAS DE DINHEIRO */}
              <ListItem>
                <ListItemIcon><ArrowDownwardIcon color="error" /></ListItemIcon>
                <ListItemText primary="Total de Sangrias" secondary={formatCurrency(resumo.totalSangrias)} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* PAINEL DA DIREITA: CONFERÊNCIA E OUTROS PAGAMENTOS */}
        <Grid item xs={12} md={6}>
           <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                Outros Pagamentos (Informativo)
            </Typography>
            <List dense>
              {todosMetodos
                .filter(metodo => metodo !== 'Dinheiro')
                .map(metodo => (
                  <React.Fragment key={metodo}>
                    <ListItem>
                      <ListItemIcon><CreditCardIcon color="action" /></ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontWeight: 'bold' }}>{metodo}</ListItemText>
                    </ListItem>
                    {(resumo.vendasPorMetodo[metodo] > 0) && (
                      <ListItem sx={{ pl: 5 }}>
                        <ListItemIcon><PointOfSaleIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Vendas" secondary={formatCurrency(resumo.vendasPorMetodo[metodo])} />
                      </ListItem>
                    )}
                    {(resumo.pagamentosDeContasPorMetodo[metodo] > 0) && (
                       <ListItem sx={{ pl: 5 }}>
                        <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Pag. de Contas" secondary={formatCurrency(resumo.pagamentosDeContasPorMetodo[metodo])} />
                      </ListItem>
                    )}
                    <Divider sx={{ my: 1 }} />
                  </React.Fragment>
                ))
              }
            </List>
            <Divider sx={{ my: 2 }} />
                
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="button" color="text.secondary">Total Esperado em Dinheiro</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(totalEsperadoDinheiro)}
              </Typography>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Conferência Manual</Typography>
            <TextField
              label="Valor Total Contado em Dinheiro"
              type="number"
              fullWidth
              value={valorInformado}
              onChange={(e) => setValorInformado(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography> }}
              autoFocus
            />

            {debouncedValorInformado !== '' && (
              <Alert 
                severity={diferenca < 0 ? 'error' : (diferenca > 0 ? 'warning' : 'success')}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1">
                  Diferença: <strong>{formatCurrency(diferenca)}</strong>
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
              >
                {isClosing ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Fechamento do Caixa'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FechamentoCaixa;