// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\FrenteDeCaixa.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; 
import { useHotkeys } from '../hooks/useHotkeys';
import Recibo from '../components/Recibo';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../contexts/auth';
import ModalAberturaCaixa from '../components/ModalAberturaCaixa';
import ModalMovimentacaoCaixa from '../components/ModalMovimentacaoCaixa';
import { toast } from 'react-toastify';
import ManagerOverrideDialog from '../components/ManagerOverrideDialog';
import ProdutoCard from '../components/ProdutoCard';
import { 
  Container, Typography, Grid, TextField, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel, IconButton,
  Box, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Divider, InputAdornment 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function FrenteDeCaixa() {
  const { user, isManager, caixaStatus, loadingCaixa } = useAuth();
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [overrideError, setOverrideError] = useState('');
  const [modalMovimentacaoOpen, setModalMovimentacaoOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('');
  const [vendaFinalizada, setVendaFinalizada] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const reciboRef = useRef(null);
  const buscaInputRef = useRef(null);
  const valorPagoInputRef = useRef(null);

  const handleLimparCarrinho = useCallback(() => {
    if (carrinho.length > 0) {
      setCarrinho([]);
      setValorPago('');
      toast.info('Carrinho limpo.');
    }
  }, [carrinho]);

  const handleImprimirRecibo = () => {
    const node = reciboRef.current;
    if (node) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
          } catch (e) { return ''; }
        }).join('\n');

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head><title>Recibo</title><style>${styles}</style></head>
          <body>${node.innerHTML}</body>
        </html>
      `);
      iframeDoc.close();
      
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      setVendaFinalizada(null); // Fecha o modal após a impressão
    }
  };


  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error('Adicione pelo menos um item à venda.');
      return;
    }

    const payload = {
      valor_total: totalVenda,
      metodo_pagamento: metodoPagamento,
      itens: carrinho.map(item => ({ id: item.id, nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
    };

    try {
      const response = await api.post('/vendas', payload);
      toast.success('Venda registrada com sucesso!');

      const novaVendaId = response.data.venda?.id;
      if (novaVendaId) {
        const responseDetalhada = await api.get(`/vendas/${novaVendaId}`);
        setVendaFinalizada(responseDetalhada.data);
      } else {
        toast.error("Ocorreu um erro ao processar a venda.");
      }

      setCarrinho([]);
      setValorPago('');

    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro crítico ao registrar a venda.');
    }
  };



  useHotkeys('F4', () => buscaInputRef.current?.focus());
  useHotkeys('F8', () => {
    if (metodoPagamento === 'Dinheiro') {
      valorPagoInputRef.current?.focus();
    }
  });
  // Agora esta linha é válida, pois 'finalizarVenda' já foi declarada acima.
  useHotkeys('F10', finalizarVenda); 
  useHotkeys('Escape', handleLimparCarrinho);
  

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos');
        const listaDeProdutos = response.data.produtos || response.data;
        if (Array.isArray(listaDeProdutos)) {
          setTodosProdutos(listaDeProdutos);
        } else {
          setTodosProdutos([]);
        }
      } catch (error) {
        toast.error('Erro ao carregar produtos.');
        setTodosProdutos([]);
      }
    };
    fetchProdutos();
  }, []);

 
  const produtosFiltrados = useMemo(() => {
    if (!termoBusca) return todosProdutos;
    return todosProdutos.filter(p =>
      p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(termoBusca))
    );
  }, [termoBusca, todosProdutos]);

  const totalVenda = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }, [carrinho]);

  useEffect(() => {
    const valorPagoFloat = parseFloat(valorPago);
    if (!isNaN(valorPagoFloat) && valorPagoFloat >= totalVenda) {
      setTroco(valorPagoFloat - totalVenda);
    } else {
      setTroco(0);
    }
  }, [valorPago, totalVenda]);

  const handleOpenMovimentacaoModal = (tipo) => {
    setTipoMovimentacao(tipo);
    setModalMovimentacaoOpen(true);
  };

  const handleCloseMovimentacaoModal = () => {
    setModalMovimentacaoOpen(false);
  };

  const adicionarAoCarrinho = (produto) => {
    setLastAddedId(produto.id); // Ativa o highlight
    setTimeout(() => setLastAddedId(null), 500); // Remove o highlight após 0.5s

    const itemExistente = carrinho.find(item => item.id === produto.id);
    const quantidadeAtualNoCarrinho = itemExistente ? itemExistente.quantidade : 0;
    if ((quantidadeAtualNoCarrinho + 1) > produto.quantidade_estoque) {
      toast.error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidade_estoque}`);
      return;
    }
    setCarrinho(carrinhoAtual => {
      const produtoExistente = carrinhoAtual.find(item => item.id === produto.id);
      if (produtoExistente) {
        return carrinhoAtual.map(item =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...carrinhoAtual, { ...produto, quantidade: 1 }];
    });
    setTermoBusca('');
  };

  const removerDoCarrinho = (produtoId) => {
    if (isManager) {
      setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== produtoId));
      toast.info('Item removido pelo gerente.');
    } else {
      setItemParaRemover(produtoId);
      setOverrideDialogOpen(true);
      setOverrideError('');
    }
  };

  const handleManagerAuthorize = async (email, senha) => {
    try {
      const response = await axios.post('http://localhost:3333/api/login', { email, senha });
      if (response.data.funcionario && response.data.funcionario.cargo === 'gerente') {
        toast.success('Autorização concedida!');
        setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== itemParaRemover));
        setOverrideDialogOpen(false);
        setItemParaRemover(null);
      } else {
        setOverrideError('Credenciais válidas, mas o usuário não é um gerente.');
      }
    } catch (error) {
      console.error("Falha na autorização:", error);
      setOverrideError('E-mail ou senha de gerente inválidos.');
    }
  };
 
  const handleNovaVenda = () => {
    setVendaFinalizada(null);
  };

  const handleQuantidadeChange = (produtoId, novaQuantidade) => {
    const qtd = parseInt(novaQuantidade, 10);
    const produtoOriginal = todosProdutos.find(p => p.id === produtoId);
    if (isNaN(qtd)) return;
    if (qtd < 1) { // Permite remover o item se a quantidade for 0 ou menor
      removerDoCarrinho(produtoId);
      return;
    }
    if (produtoOriginal && qtd > produtoOriginal.quantidade_estoque) {
      toast.error(`Estoque máximo para ${produtoOriginal.nome} é ${produtoOriginal.quantidade_estoque}.`);
      setCarrinho(carrinhoAtual => carrinhoAtual.map(item => item.id === produtoId ? { ...item, quantidade: produtoOriginal.quantidade_estoque } : item ));
      return;
    }
    setCarrinho(carrinhoAtual => carrinhoAtual.map(item => item.id === produtoId ? { ...item, quantidade: qtd } : item ));
  };

  if (loadingCaixa) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /><Typography sx={{ ml: 2 }}>Verificando status do caixa...</Typography>
      </Box>
    );
  }

  if (caixaStatus === 'FECHADO') {
    return <ModalAberturaCaixa open={true} />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2, gap: 2 }}>
      
      {/* Coluna Central (7/12) - Produtos */}
      <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Buscar Produto por nome ou código de barras"
          variant="outlined"
          value={termoBusca}
          onChange={e => setTermoBusca(e.target.value)}
          inputRef={buscaInputRef} 
        />
        <Paper sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {produtosFiltrados.map(produto => (
              <Grid item key={produto.id} xs={6} sm={4} md={3} xl={2}>
                <ProdutoCard produto={produto} onProdutoClick={adicionarAoCarrinho} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Coluna da Direita (5/12) - Carrinho e Pagamento */}
      <Paper sx={{ flex: 5, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 32px)' }}>
        <Typography variant="h5" sx={{ p: 2, pb: 1 }}>Itens da Venda</Typography>
        <Divider />
        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
          <Table stickyHeader size="small"> {/* Adicionado size="small" para mais densidade */}
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="center" sx={{ width: '130px' }}>Qtd.</TableCell> {/* Largura fixa */}
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carrinho.length > 0 ? carrinho.map(item => (
                <TableRow 
                  key={item.id}
                  // APLICA A ANIMAÇÃO DE HIGHLIGHT
                  sx={{ animation: lastAddedId === item.id ? 'highlight-add 0.5s ease-out' : 'none' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">R$ {Number(item.preco).toFixed(2)}</Typography>
                  </TableCell>
                  
                  {/* BOTÕES DE INCREMENTAR/DECREMENTAR */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => handleQuantidadeChange(item.id, item.quantidade - 1)}>
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{item.quantidade}</Typography>
                      <IconButton size="small" onClick={() => handleQuantidadeChange(item.id, item.quantidade + 1)}>
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'medium' }}>R$ {(item.quantidade * item.preco).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => removerDoCarrinho(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>Carrinho vazio</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        
        {/* Seção de Pagamento */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h5">Total</Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  R$ {totalVenda.toFixed(2)}
                </Typography>
            </Box>
          
            <FormControl fullWidth>
              <InputLabel>Método de Pagamento</InputLabel>
              <Select 
                value={metodoPagamento} 
                label="Método de Pagamento" 
                onChange={e => setMetodoPagamento(e.target.value)}
              >
                  <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
                  <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
                  <MenuItem value="Pix">Pix</MenuItem>
              </Select>
          </FormControl>            
          
            {metodoPagamento === 'Dinheiro' && (
              <TextField 
                label="Valor Pago" type="number" fullWidth value={valorPago} onChange={(e) => setValorPago(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} // Melhora a UI do campo
                inputRef={valorPagoInputRef}
              />
            )}
            
            {troco > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h6">Troco</Typography>
                <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  R$ {troco.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" fullWidth onClick={() => handleOpenMovimentacaoModal('SANGRIA')}>
                Registrar Sangria
              </Button>
              <Button variant="outlined" fullWidth onClick={() => handleOpenMovimentacaoModal('SUPRIMENTO')}>
                Registrar Suprimento
              </Button>
            </Stack>

            <Button
              variant="contained" color="success" size="large" onClick={finalizarVenda}
              disabled={carrinho.length === 0}
              sx={{ p: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Finalizar Venda
            </Button>
        </Box>
      </Paper>

      {/* Seus Modais (sem alteração no JSX, apenas na posição) */}
      <ManagerOverrideDialog open={overrideDialogOpen} onClose={() => setOverrideDialogOpen(false)} onConfirm={handleManagerAuthorize} error={overrideError} />
      <ModalMovimentacaoCaixa open={modalMovimentacaoOpen} onClose={handleCloseMovimentacaoModal} tipo={tipoMovimentacao} />
      <Dialog open={!!vendaFinalizada} onClose={() => setVendaFinalizada(null)}>
        <DialogTitle>Venda Finalizada com Sucesso!</DialogTitle>
        <DialogContent>
          {vendaFinalizada && (
            <>
              <Typography>Venda ID: {vendaFinalizada.id}</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                Total: R$ {Number(vendaFinalizada.valor_total).toFixed(2)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVendaFinalizada(null)}>Nova Venda</Button>
          {/* O BOTÃO AGORA CHAMA A NOVA FUNÇÃO DE IMPRESSÃO */}
          <Button onClick={handleImprimirRecibo} variant="contained" autoFocus>
            Imprimir Recibo
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: 'none' }}>
        {vendaFinalizada && <Recibo ref={reciboRef} venda={vendaFinalizada} />}
      </div>
    </Box>
  );
}

export default FrenteDeCaixa;