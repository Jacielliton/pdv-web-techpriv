// frontend/cadastro-funcionarios/src/pages/HistoricoVendas.js (VERSÃO VERIFICADA E CORRETA)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import {
  Container, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem,
  ListItemText, Grid, Box, CircularProgress, IconButton, Pagination, Paper, TextField,
  Button, Select, MenuItem, FormControl, InputLabel, Tooltip, FormControlLabel, Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import Recibo from '../components/Recibo';

function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({ vendaId: '', dataInicio: '', dataFim: '', metodoPagamento: '', comDesconto: false });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState(null);
  const [vendaParaImprimir, setVendaParaImprimir] = useState(null);
  const reciboRef = useRef(null);

  // ===================================================================
  // CORREÇÃO DO LOOP DE CARREGAMENTO
  // ===================================================================

  // REMOVIDO: A função fetchHistorico não é mais necessária aqui fora.

  // ALTERADO: O useEffect agora contém a lógica de busca diretamente.
  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/vendas', { 
          params: { page, ...filtrosAtivos }
        });
        setVendas(response.data.vendas || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        toast.error("Não foi possível carregar o histórico.");
        setError("Ocorreu um erro ao buscar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [page, filtrosAtivos]);


  const handleImprimirRecibo = () => {
    const node = reciboRef.current;
    if (node) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join('') } catch (e) { return '' }}).join('\n');
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`<html><head><title>Recibo</title><style>${styles}</style></head><body>${node.innerHTML}</body></html>`);
      iframeDoc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      setVendaParaImprimir(null); 
    }
  };

  useEffect(() => {
    if (vendaParaImprimir && reciboRef.current) {
      handleImprimirRecibo();
    }
  }, [vendaParaImprimir]);

  const handleCancelarClick = (e, venda) => {
    e.stopPropagation();
    setVendaParaCancelar(venda);
    setDialogOpen(true);
  };

  const handleConfirmCancelar = async () => {
    if (!vendaParaCancelar) return;
    try {
      await api.put(`/vendas/${vendaParaCancelar.id}/cancelar`);
      toast.success(`Venda #${vendaParaCancelar.id} cancelada com sucesso!`);
      
      const response = await api.get('/vendas', { params: { page, ...filtrosAtivos } });
      setVendas(response.data.vendas || []);
      setTotalPages(response.data.totalPages || 1);

    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar a venda.');
    } finally {
      setDialogOpen(false);
      setVendaParaCancelar(null);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros({
      ...filtros,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  const handleAplicarFiltros = () => {
    setPage(1);
    setFiltrosAtivos(filtros);
  };

  const handleLimparFiltros = () => {
    setPage(1);
    setFiltros({ vendaId: '', dataInicio: '', dataFim: '', metodoPagamento: '', comDesconto: false });
    setFiltrosAtivos({});
  };

  const handlePageChange = (event, value) => { setPage(value); };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>Histórico de Vendas</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">          
          <Grid item xs={12} sm={3}><TextField name="vendaId" label="Buscar por ID" value={filtros.vendaId} onChange={handleFiltroChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} sm={3}><TextField name="dataInicio" label="Data Início" type="date" value={filtros.dataInicio} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={3}><TextField name="dataFim" label="Data Fim" type="date" value={filtros.dataFim} onChange={handleFiltroChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={3}><FormControl fullWidth size="small">            
            <Select name="metodoPagamento" value={filtros.metodoPagamento} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Método pagamento</em></MenuItem>
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
              <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
              <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
              <MenuItem value="Pix">Pix</MenuItem>
            </Select>
          </FormControl></Grid>
          
          {/* ========== ALTERAÇÃO 4: Adicionar o checkbox na tela ========== */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filtros.comDesconto}
                  onChange={handleFiltroChange}
                  name="comDesconto"
                  color="primary"
                />
              }
              label="Apenas vendas com desconto"
            />
          </Grid>

          <Grid item xs={12} sm={3}><Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Filtrar</Button></Grid>
          <Grid item xs={12} sm={3}><Button variant="outlined" onClick={handleLimparFiltros} fullWidth>Limpar Filtros</Button></Grid>
        </Grid>
      </Paper>
      
      {vendas.map(venda => {
        // ========== ALTERAÇÃO 5: Calcular o subtotal antes de renderizar ==========
        const subtotal = Number(venda.valor_total) + Number(venda.desconto);
        const temDesconto = Number(venda.desconto) > 0;

        return (
          <Accordion key={venda.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Grid item xs={12} md={5}>
                  <Typography><strong>Venda #{venda.id}</strong> - {new Date(venda.data_venda).toLocaleString('pt-BR')}</Typography>
                </Grid>
                
                {/* ========== ALTERAÇÃO 6: Exibir Subtotal, Desconto e Total ========== */}
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Typography variant="body2">Subtotal: R$ {subtotal.toFixed(2)}</Typography>
                  
                  {temDesconto && (
                    <Typography variant="body2" color="error">- Desconto: R$ {Number(venda.desconto).toFixed(2)}</Typography>
                  )}
                  
                  <Typography variant="body1"><strong>Total: R$ {Number(venda.valor_total).toFixed(2)}</strong></Typography>
                </Grid>

                <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Imprimir Recibo">
                    <IconButton onClick={(e) => { e.stopPropagation(); setVendaParaImprimir(venda); }} color="primary"><PrintIcon /></IconButton>
                  </Tooltip>
                  {venda.status === 'CONCLUIDA' && (
                    <Tooltip title="Cancelar Venda">
                      <IconButton onClick={(e) => handleCancelarClick(e, venda)} color="error"><CancelIcon /></IconButton>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="subtitle1"><strong>Operador:</strong> {venda.Funcionario?.nome || 'N/A'}</Typography>

                {venda.Vendedor && (
                  <Typography variant="subtitle1"><strong>Vendedor:</strong> {venda.Vendedor.nome}</Typography>
                )}
                
                {venda.Cliente && (
                  <Typography variant="subtitle1"><strong>Cliente:</strong> {venda.Cliente.nome}</Typography>
                )}

                <Typography variant="subtitle1"><strong>Pagamento:</strong> {venda.metodo_pagamento}</Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Itens Vendidos:</Typography>
                <List dense>
                  {venda.VendaItems.map((item, index) => ( <ListItem key={index}> <ListItemText primary={`${item.quantidade}x ${item.Produto.nome}`} secondary={`(R$ ${Number(item.preco_unitario).toFixed(2)} cada)`}/> </ListItem> ))}
                </List>
              </Box>
            </AccordionDetails>
        </Accordion>
        )
      })}

      {totalPages > 1 && (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" /></Box>)}
      
      <ConfirmDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={handleConfirmCancelar} title="Confirmar Cancelamento" description={`Tem certeza que deseja cancelar a venda #${vendaParaCancelar?.id}? Esta ação não pode ser desfeita e o estoque dos produtos será estornado.`} />
      <div style={{ display: 'none' }}>
        {vendaParaImprimir && <Recibo ref={reciboRef} venda={vendaParaImprimir} />}
      </div>
    </Container>
  );
}

export default HistoricoVendas;