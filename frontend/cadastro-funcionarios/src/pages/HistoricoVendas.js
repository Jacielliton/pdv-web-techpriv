// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\HistoricoVendas.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Importando componentes do MUI
import {
  Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, Grid, Box, CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/vendas');
        setVendas(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico de vendas:", err);
        setError("Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, []);
  
  // O MUI Accordion gerencia o estado de expandir/recolher, então não precisamos mais do 'vendaAbertaId'

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Vendas
      </Typography>
      {vendas.length === 0 ? (
        <Typography>Nenhuma venda registrada ainda.</Typography>
      ) : (
        vendas.map(venda => (
          <Accordion key={venda.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center">
                <Grid xs={3}>
                  <Typography><strong>Venda #{venda.id}</strong></Typography>
                </Grid>
                <Grid xs={5}>
                  <Typography color="textSecondary">
                    {new Date(venda.data_venda).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid xs={4} sx={{ textAlign: 'right' }}>
                  <Typography>
                    Total: <strong>R$ {Number(venda.valor_total).toFixed(2)}</strong>
                  </Typography>
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
        ))
      )}
    </Container>
  );
}

export default HistoricoVendas;