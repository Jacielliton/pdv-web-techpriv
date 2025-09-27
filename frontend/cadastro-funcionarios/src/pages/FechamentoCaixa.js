// frontend/cadastro-funcionarios/src/pages/FechamentoCaixa.js (VERSÃO COM DEBOUNCE)

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
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; // Importe um ícone de "saída"
import CreditCardIcon from '@mui/icons-material/CreditCard';



const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

function FechamentoCaixa() {
  const { atualizarCaixaStatus, isManager, signOut } = useAuth();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valorInformado, setValorInformado] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // --- NOVO ESTADO PARA O DEBOUNCE ---
  const [debouncedValorInformado, setDebouncedValorInformado] = useState('');

  // --- NOVO useEffect PARA APLICAR O DEBOUNCE ---
  useEffect(() => {
    // Cria um timer que vai atualizar o valor "debounced" após 300ms
    const timerId = setTimeout(() => {
      setDebouncedValorInformado(valorInformado);
    }, 300);

    // Função de limpeza: se o usuário digitar novamente, o timer anterior é cancelado
    return () => {
      clearTimeout(timerId);
    };
  }, [valorInformado]); // Este efeito roda sempre que o 'valorInformado' muda

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

  // --- useMemo AGORA USA O VALOR "DEBOUNCED" PARA OS CÁLCULOS ---
  const { totalEsperadoDinheiro, diferenca } = useMemo(() => {
    if (!resumo) return { totalEsperadoDinheiro: 0, diferenca: 0 };
    
    // A LÓGICA DE CÁLCULO JÁ ESTÁ CORRETA AQUI, POIS ELA PEGA APENAS VENDAS EM DINHEIRO
    const totalDinheiroVendas = resumo.totaisPorPagamento.Dinheiro || 0;
    const valorEsperado = resumo.valor_inicial + totalDinheiroVendas + resumo.totalSuprimentos + resumo.totalPagamentosFiado - resumo.totalSangrias;
    
    const valorContado = parseFloat(debouncedValorInformado) || 0;
    const diff = valorContado - valorEsperado;
    return { totalEsperadoDinheiro: valorEsperado, diferenca: diff };
  }, [resumo, debouncedValorInformado]);


  const handleFecharCaixa = async () => {
    // ... (esta função permanece exatamente a mesma)
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Resumo do Sistema</Typography>
            <List>
              {/* --- ENTRADAS DE DINHEIRO --- */}
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Valor de Abertura (Troco)" secondary={formatCurrency(resumo.valor_inicial)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                <ListItemText primary="Vendas em Dinheiro" secondary={formatCurrency(resumo.totaisPorPagamento.Dinheiro)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                <ListItemText primary="Pagamentos de Contas (Fiado)" secondary={formatCurrency(resumo.totalPagamentosFiado)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><ArrowUpwardIcon color="success" /></ListItemIcon>
                <ListItemText primary="Total de Suprimentos" secondary={formatCurrency(resumo.totalSuprimentos)} />
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* --- SAÍDAS DE DINHEIRO --- */}
              <ListItem>
                <ListItemIcon><ArrowDownwardIcon color="error" /></ListItemIcon>
                <ListItemText primary="Total de Sangrias" secondary={formatCurrency(resumo.totalSangrias)} />
              </ListItem>
              
              <Divider sx={{ my: 1 }} />             
              

              {/* --- INFORMATIVO (VENDAS A PRAZO) --- */}
              <ListItem>
                <ListItemIcon><RemoveCircleOutlineIcon color="action" /></ListItemIcon>
                <ListItemText 
                    primary="Vendas a Prazo (Fiado)" 
                    secondary={formatCurrency(resumo.totalVendasAPrazo)}
                    secondaryTypographyProps={{ style: { color: 'gray', fontStyle: 'italic' } }}
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />            
          </Paper>
        </Grid>

        {/* O Lado direito (Conferência Manual) não precisa de alterações */}
        <Grid item xs={12} md={6}>
           {/* ... (código existente sem alterações) ... */}
           <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="subtitle2" sx={{ pl: 2, color: 'text.secondary' }}>
                Outros Pagamentos (Informativo)
              </Typography>
            {Object.entries(resumo.totaisPorPagamento)
                // Filtramos para não mostrar 'Dinheiro' e 'A Prazo' novamente
                .filter(([metodo]) => metodo !== 'Dinheiro' && metodo !== 'A Prazo')
                .map(([metodo, total]) => (
                  <ListItem key={metodo}>
                    <ListItemIcon>
                      <CreditCardIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary={`Vendas em ${metodo}`} secondary={formatCurrency(total)} />
                  </ListItem>
                ))
              }

              <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="button" color="text.secondary">Total Esperado em Dinheiro</Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalEsperadoDinheiro)}
                </Typography>
            </Box>
            
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

            {debouncedValorInformado !== '' && (
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