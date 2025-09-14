// src/pages/HistoricoVendas.js

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api'; // ALTERADO: Importa a instância 'api'
import { useReactToPrint } from 'react-to-print';
import Recibo from '../components/Recibo';
import {
  Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, Grid, Box, CircularProgress, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'react-toastify';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendaParaImprimir, setVendaParaImprimir] = useState(null);
  const reciboRef = useRef();

  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      try {
        // ALTERADO: Usa 'api' e a URL relativa
        const response = await api.get('/vendas');
        setVendas(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico de vendas:", err);
        setError("Não foi possível carregar o histórico.");
        toast.error("Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, []);
  
  const handlePrint = useReactToPrint({
    content: () => reciboRef.current,
    onAfterPrint: () => setVendaParaImprimir(null)
  });

  const prepararImpressao = (venda) => {
    setVendaParaImprimir(venda);
  };
  
  useEffect(() => {
    if (vendaParaImprimir) {
      handlePrint();
    }
  }, [vendaParaImprimir, handlePrint]);


  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Vendas
      </Typography>
      {vendas.map(venda => (
        <Accordion key={venda.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography><strong>Venda #{venda.id}</strong> - {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography>Total: <strong>R$ {Number(venda.valor_total).toFixed(2)}</strong></Typography>
                <IconButton onClick={(e) => { e.stopPropagation(); prepararImpressao(venda); }} color="primary" sx={{ ml: 2 }}>
                  <PrintIcon />
                </IconButton>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
              <Box>
                <Typography variant="subtitle1"><strong>Operador:</strong> {venda.Funcionario?.nome || 'N/A'}</Typography>
                <Typography variant="subtitle1"><strong>Pagamento:</strong> {venda.metodo_pagamento}</Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Itens Vendidos:</Typography>
                <List dense>
                  {venda.VendaItems.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${item.quantidade}x ${item.Produto.nome}`}
                        secondary={`(R$ ${Number(item.preco_unitario).toFixed(2)} cada)`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </AccordionDetails>
        </Accordion>
      ))}

      <div style={{ display: 'none' }}>
        <Recibo ref={reciboRef} venda={vendaParaImprimir} />
      </div>
    </Container>
  );
}

export default HistoricoVendas;