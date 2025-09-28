// frontend/cadastro-funcionarios/src/components/ModalDetalhesCaixa.js (VERSÃO COM CÁLCULO CORRIGIDO)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
  Box, Typography, List, ListItem, Divider
} from '@mui/material';
import { toast } from 'react-toastify';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
}

// Componente para renderizar uma linha de detalhe. Não aplica formatação.
const DetailRow = ({ label, value, isTotal = false }) => (
  <ListItem sx={{ py: 0.25 }} disablePadding>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Typography variant="body2" color={isTotal ? 'text.primary' : 'text.secondary'} fontWeight={isTotal ? 'bold' : 'normal'}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={isTotal ? 'bold' : '500'}>
        {value}
      </Typography>
    </Box>
  </ListItem>
);

// Componente para renderizar seções com dados NUMÉRICOS que precisam de formatação.
const ValueSection = ({ title, data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  return (
    <>
      <Typography variant="overline" display="block" color="text.secondary" sx={{ mt: 2 }}>
        {title}
      </Typography>
      <List dense>
        {Object.entries(data).map(([key, total]) => (
          <DetailRow key={key} label={key} value={formatCurrency(total)} />
        ))}
      </List>
    </>
  );
};

function ModalDetalhesCaixa({ open, onClose, caixaId }) {
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDetalhes(null);
      return;
    }
    if (caixaId) {
      const fetchDetalhes = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/caixas/${caixaId}/detalhes`);
          console.log('Dados recebidos do backend:', response.data);
          setDetalhes(response.data);
        } catch (error) {
          toast.error("Erro ao carregar os detalhes do caixa.");
          console.error("Erro ao buscar detalhes do caixa", error);
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchDetalhes();
    }
  }, [open, caixaId, onClose]);

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }
    if (!detalhes) {
      return null;
    }

    const totalPagamentosDeContas = Object.values(detalhes.pagamentosDeContasPorMetodo || {}).reduce((sum, val) => sum + val, 0);

    const totalDinheiroEntrada = (detalhes.vendasPorMetodo?.Dinheiro || 0) + (detalhes.pagamentosDeContasPorMetodo?.Dinheiro || 0);
    
    // ===================================================================
    // CORREÇÃO: Usando parseFloat() para garantir que a conta seja matemática
    // ===================================================================
    const valorEsperado = parseFloat(detalhes.caixa.valor_inicial || 0)
                        + parseFloat(detalhes.movimentacoes?.SUPRIMENTO || 0)
                        + totalDinheiroEntrada
                        - parseFloat(detalhes.movimentacoes?.SANGRIA || 0);

    // CORREÇÃO: Recalculando a diferença para garantir consistência
    const diferencaCalculada = parseFloat(detalhes.caixa.valor_final_informado || 0) - valorEsperado;
    // ===================================================================

    return (
      <Box>
        <Typography variant="overline" display="block" color="text.secondary">
          Informações Gerais
        </Typography>
        <List dense>
          <DetailRow label="Operador" value={detalhes.caixa.Funcionario?.nome || 'N/A'} />
          <DetailRow label="Abertura do Caixa" value={formatDate(detalhes.caixa.data_abertura)} />
          <DetailRow label="Fechamento do Caixa" value={formatDate(detalhes.caixa.data_fechamento)} />
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="overline" display="block" color="text.secondary">
          Resumo Financeiro
        </Typography>
        <List dense>
          <DetailRow label="Valor Inicial (Troco)" value={formatCurrency(detalhes.caixa.valor_inicial)} />
          <DetailRow label="(+) Suprimentos" value={formatCurrency(detalhes.movimentacoes?.SUPRIMENTO)} />
          <DetailRow label="(+) Dinheiro (Vendas + Contas)" value={formatCurrency(totalDinheiroEntrada)} />
          <DetailRow label="(-) Sangrias" value={formatCurrency(detalhes.movimentacoes?.SANGRIA)} />
          
          <Divider sx={{ my: 1, mx: -2 }} />
          
          <DetailRow label="(=) Valor Esperado no Caixa" value={formatCurrency(valorEsperado)} isTotal />
          <DetailRow label="(?) Valor Informado" value={formatCurrency(detalhes.caixa.valor_final_informado)} />
          {/* CORREÇÃO: Usando a diferença recalculada */}
          <DetailRow label="Diferença" value={formatCurrency(diferencaCalculada)} isTotal />
        </List>
        
        <Divider sx={{ my: 2 }} />

        <ValueSection title="Vendas Realizadas" data={detalhes.vendasPorMetodo} />
        {detalhes.vendasPorMetodo && Object.keys(detalhes.vendasPorMetodo).length > 0 && (
          <List dense><DetailRow label="Total de Vendas" value={formatCurrency(detalhes.caixa.valor_final_calculado)} isTotal /></List>
        )}
        
        <ValueSection title="Pagamentos de Contas Recebidos" data={detalhes.pagamentosDeContasPorMetodo} />
        {totalPagamentosDeContas > 0 && (
          <List dense><DetailRow label="Total Recebido de Contas" value={formatCurrency(totalPagamentosDeContas)} isTotal /></List>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Detalhes do Fechamento de Caixa</DialogTitle>
      <DialogContent dividers>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalDetalhesCaixa;