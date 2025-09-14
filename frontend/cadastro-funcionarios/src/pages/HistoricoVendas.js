// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\HistoricoVendas.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print'; // 1. Importe o hook de impressão
import Recibo from '../components/Recibo'; // 2. Importe o nosso componente de recibo


// Importando componentes do MUI
import {
  Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, Grid, Box, CircularProgress, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Crie o estado e a referência para o recibo
  const [vendaParaImprimir, setVendaParaImprimir] = useState(null);
  const reciboRef = useRef();

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
  
  // 4. Configure o hook de impressão
  const handlePrint = useReactToPrint({
    content: () => reciboRef.current,
    onAfterPrint: () => setVendaParaImprimir(null) // Limpa o estado após a impressão
  });

  // 5. Crie a função que prepara os dados e chama a impressão
  const prepararImpressao = (venda) => {
    setVendaParaImprimir(venda);
  };
  
  // O useEffect abaixo garante que a impressão seja chamada após o estado ser atualizado
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
                {/* 6. Adicione o botão de impressão */}
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

      {/* 7. Adicione o componente de recibo escondido */}
      <div style={{ display: 'none' }}>
        <Recibo ref={reciboRef} venda={vendaParaImprimir} />
      </div>
    </Container>
  );
}

export default HistoricoVendas;