import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
  Box, Typography, Grid, List, ListItem, ListItemText, Divider
} from '@mui/material';

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleString('pt-BR');

const DetailRow = ({ label, value }) => (
  <>
    <ListItem sx={{ py: 0.5 }}>
      <ListItemText
        primary={label}
        secondary={value}
        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        secondaryTypographyProps={{ variant: 'body1', fontWeight: '500', color: 'text.primary', component: 'span' }}
      />
    </ListItem>
    <Divider component="li" />
  </>
);

function ModalDetalhesCaixa({ open, onClose, caixaId }) {
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && caixaId) {
      const fetchDetalhes = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/caixas/${caixaId}/detalhes`);
          setDetalhes(response.data);
        } catch (error) {
          console.error("Erro ao buscar detalhes do caixa", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetalhes();
    }
  }, [open, caixaId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Fechamento de Caixa</DialogTitle>
      <DialogContent>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
        {detalhes && !loading && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <List dense>
                <DetailRow label="Operador" value={detalhes.caixa.Funcionario?.nome} />
                <DetailRow label="Abertura do Caixa" value={formatDate(detalhes.caixa.data_abertura)} />
                <DetailRow label="Fechamento do Caixa" value={formatDate(detalhes.caixa.data_fechamento)} />
              </List>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">Resumo Financeiro</Typography>
              <List dense>
                <DetailRow label="Valor Inicial (Troco)" value={formatCurrency(detalhes.caixa.valor_inicial)} />
                <DetailRow label="Suprimentos" value={formatCurrency(detalhes.movimentacoes.SUPRIMENTO)} />
                <DetailRow label="Sangrias" value={formatCurrency(detalhes.movimentacoes.SANGRIA)} />
                <DetailRow label="Valor Informado" value={formatCurrency(detalhes.caixa.valor_final_informado)} />
                <DetailRow label="Diferença" value={formatCurrency(detalhes.caixa.diferenca)} />
              </List>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="overline" color="text.secondary">Vendas por Pagamento</Typography>
              <List dense>
                {Object.entries(detalhes.vendasPorMetodo).map(([metodo, total]) => (
                  <DetailRow key={metodo} label={metodo} value={formatCurrency(total)} />
                ))}
                 <DetailRow label="Total de Vendas" value={formatCurrency(detalhes.caixa.valor_final_calculado)} />
              </List>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalDetalhesCaixa;