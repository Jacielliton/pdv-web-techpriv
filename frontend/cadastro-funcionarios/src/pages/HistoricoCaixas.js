// frontend/src/pages/HistoricoCaixas.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Container, Typography, Paper, Box, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

const formatCurrency = (value) => `R$ ${Number(value).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

function HistoricoCaixas() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await api.get('/caixas/historico');
        setHistorico(response.data);
      } catch (error) {
        toast.error('Não foi possível carregar o histórico de caixas.');
        console.error("Erro ao buscar histórico de caixas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Fechamentos de Caixa
      </Typography>
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
    </Container>
  );
}

export default HistoricoCaixas;