// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\FrenteDeCaixa.js (VERSÃO FINAL CORRIGIDA)

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useHotkeys } from '../hooks/useHotkeys';
import api from '../services/api';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import axios from 'axios'; // Importe o axios para a função de autorização do gerente
import { Box, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// Nossos componentes filhos
import GridProdutosVenda from '../components/GridProdutosVenda';
import PainelVenda from '../components/PainelVenda';
import Recibo from '../components/Recibo';
import ModalAberturaCaixa from '../components/ModalAberturaCaixa';
import ModalMovimentacaoCaixa from '../components/ModalMovimentacaoCaixa';
import ManagerOverrideDialog from '../components/ManagerOverrideDialog';
import ModalSelecionarCliente from '../components/ModalSelecionarCliente';
import ModalDesconto from '../components/ModalDesconto';

function FrenteDeCaixa() {
  const { isManager, caixaStatus, loadingCaixa } = useAuth();

  // Estados principais
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [desconto, setDesconto] = useState(0);
  
  // Estados de UI e Modais
  const [termoBusca, setTermoBusca] = useState('');
  const [lastAddedId, setLastAddedId] = useState(null);
  const [vendaFinalizada, setVendaFinalizada] = useState(null);
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [modalDescontoOpen, setModalDescontoOpen] = useState(false);
  const [modalMovimentacaoOpen, setModalMovimentacaoOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [overrideError, setOverrideError] = useState('');

  // Refs
  const reciboRef = useRef(null);
  const buscaInputRef = useRef(null); // Para o atalho F4
  const valorPagoInputRef = useRef(null); // Para o atalho F8

  // Cálculos Memoizados
  const subtotal = useMemo(() => carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0), [carrinho]);
  const totalVenda = useMemo(() => (subtotal > desconto ? subtotal - desconto : 0), [subtotal, desconto]);

  // ===================================================================
  // BLOCO DE FUNÇÕES DE MANIPULAÇÃO (HANDLERS)
  // ===================================================================

  const adicionarAoCarrinho = useCallback((produto) => {
    setLastAddedId(produto.id);
    setTimeout(() => setLastAddedId(null), 500);
    const itemExistente = carrinho.find(item => item.id === produto.id);
    const qtdNoCarrinho = itemExistente ? itemExistente.quantidade : 0;
    if ((qtdNoCarrinho + 1) > produto.quantidade_estoque) {
      toast.error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidade_estoque}`);
      return;
    }
    setCarrinho(carrinhoAtual => {
      if (itemExistente) {
        return carrinhoAtual.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...carrinhoAtual, { ...produto, quantidade: 1 }];
    });
    setTermoBusca('');
  }, [carrinho]);

  const removerDoCarrinho = useCallback((produtoId) => {
    if (isManager) {
      setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== produtoId));
      toast.info('Item removido pelo gerente.');
    } else {
      setItemParaRemover(produtoId);
      setOverrideDialogOpen(true);
      setOverrideError('');
    }
  }, [isManager]);

  const handleQuantidadeChange = useCallback((produtoId, novaQuantidade) => {
    const qtd = parseInt(novaQuantidade, 10);
    if (qtd < 1) {
      removerDoCarrinho(produtoId);
      return;
    }
    const produtoOriginal = todosProdutos.find(p => p.id === produtoId);
    if (produtoOriginal && qtd > produtoOriginal.quantidade_estoque) {
      toast.error(`Estoque máximo para ${produtoOriginal.nome} é ${produtoOriginal.quantidade_estoque}.`);
      setCarrinho(carrinhoAtual => carrinhoAtual.map(item => item.id === produtoId ? { ...item, quantidade: produtoOriginal.quantidade_estoque } : item ));
      return;
    }
    setCarrinho(carrinhoAtual => carrinhoAtual.map(item => item.id === produtoId ? { ...item, quantidade: qtd } : item ));
  }, [todosProdutos, removerDoCarrinho]);

  const handleLimparCarrinho = useCallback(() => {
    if (carrinho.length > 0) {
      setCarrinho([]);
      setDesconto(0);
      setClienteSelecionado(null);
      toast.info('Venda cancelada.');
    }
  }, [carrinho]);

  const handleManagerAuthorize = useCallback(async (email, senha) => {
    try {
      const response = await axios.post('http://localhost:3333/api/login', { email, senha });
      if (response.data.funcionario?.cargo === 'gerente') {
        toast.success('Autorização concedida!');
        setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== itemParaRemover));
        setOverrideDialogOpen(false);
      } else {
        setOverrideError('Credenciais válidas, mas o usuário não é um gerente.');
      }
    } catch (error) {
      setOverrideError('E-mail ou senha de gerente inválidos.');
    }
  }, [itemParaRemover]);

  const finalizarVenda = useCallback(async (metodoPagamento, valorPago) => {
    const payload = {
      valor_total: totalVenda,
      metodo_pagamento: metodoPagamento,
      itens: carrinho.map(item => ({ id: item.id, nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
      cliente_id: clienteSelecionado ? clienteSelecionado.id : null,
      desconto: desconto,
    };
    try {
      const response = await api.post('/vendas', payload);
      toast.success('Venda registrada com sucesso!');
      const novaVendaId = response.data.venda?.id;
      if (novaVendaId) {
        const responseDetalhada = await api.get(`/vendas/${novaVendaId}`);
        setVendaFinalizada(responseDetalhada.data);
      }
      setCarrinho([]);
      setDesconto(0);
      setClienteSelecionado(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro crítico ao registrar a venda.');
    }
  }, [carrinho, totalVenda, clienteSelecionado, desconto]);
  
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
      setVendaFinalizada(null);
    }
  };

  // ===================================================================
  // HOOKS DE EFEITO E ATALHOS
  // ===================================================================

  // Atalhos do Teclado
  useHotkeys('F4', () => buscaInputRef.current?.focus());
  useHotkeys('F8', () => valorPagoInputRef.current?.focus());
  useHotkeys('F10', finalizarVenda); 
  useHotkeys('Escape', handleLimparCarrinho);
  
  // Efeito para buscar produtos na montagem do componente
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos');
        setTodosProdutos(response.data.produtos || response.data || []);
      } catch (error) {
        toast.error('Erro ao carregar produtos.');
      }
    };
    fetchProdutos();
  }, []);
 
  // Renderização condicional de Loading e Caixa Fechado
  if (loadingCaixa) { return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>; }
  if (caixaStatus === 'FECHADO') { return <ModalAberturaCaixa open={true} />; }

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2, gap: 2 }}>
      <GridProdutosVenda
        produtos={todosProdutos}
        termoBusca={termoBusca}
        onTermoBuscaChange={setTermoBusca}
        onAdicionarAoCarrinho={adicionarAoCarrinho}
        // CORREÇÃO: A ref agora é passada corretamente usando React.forwardRef
        ref={buscaInputRef} 
      />
      
      <PainelVenda
        carrinho={carrinho}
        subtotal={subtotal}
        desconto={desconto}
        totalVenda={totalVenda}
        clienteSelecionado={clienteSelecionado}
        lastAddedId={lastAddedId}
        onQuantidadeChange={handleQuantidadeChange}
        onRemoverDoCarrinho={removerDoCarrinho}
        onFinalizarVenda={finalizarVenda}
        onAbrirModalMovimentacao={(tipo) => { setTipoMovimentacao(tipo); setModalMovimentacaoOpen(true); }}
        onAbrirModalCliente={() => setModalClienteOpen(true)}
        onRemoverCliente={() => setClienteSelecionado(null)}
        onAbrirModalDesconto={() => setModalDescontoOpen(true)}
        onRemoverDesconto={() => setDesconto(0)}
        ref={valorPagoInputRef} // Passando a ref para o componente filho
      />

      {/* RENDERIZAÇÃO DE TODOS OS MODAIS */}
      <ModalDesconto open={modalDescontoOpen} onClose={() => setModalDescontoOpen(false)} onAplicar={setDesconto} subtotal={subtotal} />
      <ModalSelecionarCliente open={modalClienteOpen} onClose={() => setModalClienteOpen(false)} onClienteSelecionado={setClienteSelecionado} />
      <ModalMovimentacaoCaixa open={modalMovimentacaoOpen} onClose={() => setModalMovimentacaoOpen(false)} tipo={tipoMovimentacao} />
      <ManagerOverrideDialog open={overrideDialogOpen} onClose={() => setOverrideDialogOpen(false)} onConfirm={handleManagerAuthorize} error={overrideError} />
      <Dialog open={!!vendaFinalizada} onClose={() => setVendaFinalizada(null)}>
        <DialogTitle>Venda Finalizada com Sucesso!</DialogTitle>
        <DialogContent>
            {vendaFinalizada && <Typography>Venda ID: {vendaFinalizada.id}</Typography>}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setVendaFinalizada(null)}>Nova Venda</Button>
            <Button onClick={handleImprimirRecibo} variant="contained">Imprimir Recibo</Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: 'none' }}>{vendaFinalizada && <Recibo ref={reciboRef} venda={vendaFinalizada} />}</div>
    </Box>
  );
}

export default FrenteDeCaixa;