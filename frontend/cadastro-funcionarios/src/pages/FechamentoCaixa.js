// frontend/cadastro-funcionarios/src/pages/FechamentoCaixa.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import { 
  Container, Typography, Paper, Box, Grid, TextField, Button, 
  CircularProgress, Divider, Alert 
} from '@mui/material';

function FechamentoCaixa() {
  const { atualizarCaixaStatus } = useAuth(); // Usado para avisar o app que o caixa fechou
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
        navigate('/'); // Redireciona para o dashboard se não houver caixa aberto
      } finally {
        setLoading(false);
      }
    };
    fetchResumo();
  }, [navigate]);

  // Calcula o total esperado em dinheiro e a diferença em tempo real
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
      toast.success('Caixa fechado com sucesso!');
      await atualizarCaixaStatus(); // Atualiza o status global do caixa
      navigate('/historico-caixas'); // Redireciona para o histórico de caixas
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível fechar o caixa.');
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
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
      <Paper sx={{ p: 3 }}>
        {resumo && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Resumo do Sistema</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Valor de Abertura (Troco): <strong>R$ {resumo.valor_inicial.toFixed(2)}</strong></Typography>
              <Typography>Vendas em Dinheiro: <strong>R$ {(resumo.totaisPorPagamento.Dinheiro || 0).toFixed(2)}</strong></Typography>
              <Typography>Total de Suprimentos: <strong>R$ {resumo.totalSuprimentos.toFixed(2)}</strong></Typography>
              <Typography color="text.secondary">Total de Sangrias: <strong>- R$ {resumo.totalSangrias.toFixed(2)}</strong></Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" component="p">Total Esperado em Dinheiro: <strong>R$ {totalEsperadoDinheiro.toFixed(2)}</strong></Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Conferência Manual</Typography>
              <Divider sx={{ my: 1 }} />
              <TextField
                label="Valor Total Contado em Dinheiro (R$)"
                type="number"
                fullWidth
                value={valorInformado}
                onChange={(e) => setValorInformado(e.target.value)}
                sx={{ mt: 2 }}
                autoFocus
              />
            </Grid>

            {valorInformado !== '' && (
              <Grid item xs={12}>
                  <Alert 
                    severity={diferenca < 0 ? 'error' : (diferenca > 0 ? 'warning' : 'success')}
                  >
                    <Typography variant="h6">
                      Diferença: R$ {diferenca.toFixed(2)}
                      {diferenca < 0 && ' (Quebra de caixa)'}
                      {diferenca > 0 && ' (Sobra de caixa)'}
                      {diferenca === 0 && ' (Caixa correto)'}
                    </Typography>
                  </Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ position: 'relative', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleFecharCaixa}
                  disabled={isClosing}
                >
                  Confirmar Fechamento do Caixa
                </Button>
                {isClosing && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '15%', mt: '-12px' }} />}
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default FechamentoCaixa;