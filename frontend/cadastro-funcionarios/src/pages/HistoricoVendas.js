// src/pages/HistoricoVendas.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Recibo from '../components/Recibo';
import { useReactToPrint } from 'react-to-print';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Grid, Box, CircularProgress, IconButton, Pagination } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'react-toastify';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendaParaImprimir, setVendaParaImprimir] = useState(null);
  const reciboRef = useRef();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. ADICIONE O ESTADO PARA O ERRO
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async (currentPage) => {
      setLoading(true);
      setError(null); // Limpa erros antigos antes de uma nova busca
      try {
        const response = await api.get('/vendas', { params: { page: currentPage } });
        setVendas(response.data.vendas);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        toast.error("Não foi possível carregar o histórico.");
        // 2. ATUALIZE O ESTADO DE ERRO QUANDO A BUSCA FALHAR
        setError("Ocorreu um erro ao buscar os dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico(page);
  }, [page]);
  
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


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
  
  // Agora a variável 'error' existe e esta linha funcionará
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;

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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
      <div style={{ display: 'none' }}><Recibo ref={reciboRef} venda={vendaParaImprimir} /></div>
    </Container>
  );
}

export default HistoricoVendas;