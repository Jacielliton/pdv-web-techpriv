// frontend/src/components/ExtratoCliente.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, CircularProgress } from '@mui/material';
import ModalRegistrarPagamento from './ModalRegistrarPagamento';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

const ExtratoCliente = ({ clienteId }) => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  const fetchContas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/clientes/${clienteId}/contas`);
      setContas(response.data);
    } catch (error) {
      toast.error('Erro ao carregar extrato do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  const handleAbrirModal = (conta) => {
    setContaSelecionada(conta);
    setModalOpen(true);
  };
  
  const saldoTotalDevedor = contas.reduce((acc, conta) => acc + (conta.valor_total - conta.valor_pago), 0);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Saldo Devedor Total: {formatCurrency(saldoTotalDevedor)}</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Venda ID</TableCell><TableCell>Data</TableCell><TableCell>Valor Total</TableCell><TableCell>Valor Pago</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
          <TableBody>
            {contas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell>#{conta.Venda?.id}</TableCell>
                <TableCell>{formatDate(conta.Venda?.data_venda)}</TableCell>
                <TableCell>{formatCurrency(conta.valor_total)}</TableCell>
                <TableCell>{formatCurrency(conta.valor_pago)}</TableCell>
                <TableCell><Chip label={conta.status} color={conta.status === 'PAGA' ? 'success' : (conta.status === 'PAGA_PARCIALMENTE' ? 'warning' : 'error')} size="small" /></TableCell>
                <TableCell>
                  {conta.status !== 'PAGA' && (
                    <Button variant="contained" size="small" onClick={() => handleAbrirModal(conta)}>Registrar Pagamento</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalRegistrarPagamento 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        conta={contaSelecionada}
        onSucesso={fetchContas}
      />
    </Box>
  );
};

export default ExtratoCliente;