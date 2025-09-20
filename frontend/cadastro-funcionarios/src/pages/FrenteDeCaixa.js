// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\FrenteDeCaixa.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // MANTENHA o axios global para a chamada de login
import api from '../services/api'; // IMPORTE a nova instância configurada
import { useAuth } from '../contexts/auth';
import ModalAberturaCaixa from '../components/ModalAberturaCaixa';
import ModalMovimentacaoCaixa from '../components/ModalMovimentacaoCaixa';
import { toast } from 'react-toastify';
import ManagerOverrideDialog from '../components/ManagerOverrideDialog';
import ProdutoCard from '../components/ProdutoCard';
import { 
  Container, Typography, Grid, TextField, List, ListItem, ListItemButton, ListItemText,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel, IconButton,
  Box, CircularProgress, Stack 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


function FrenteDeCaixa() {
  const { signOut, user, isManager, caixaStatus, loadingCaixa } = useAuth();
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [overrideError, setOverrideError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [pagamentoPendente, setPagamentoPendente] = useState(false);
  const [modalMovimentacaoOpen, setModalMovimentacaoOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState(''); // 'SANGRIA' ou 'SUPRIMENTO'


  // Busca a lista de produtos
   useEffect(() => {
    const fetchProdutos = async () => {
      try {
        // A chamada continua a mesma, sem passar a página
        const response = await api.get('/produtos');
        
        // --- LÓGICA CORRIGIDA ---
        // Verifica se a resposta é um objeto de paginação (tem a propriedade 'produtos')
        // Se for, pega o array de dentro. Se não, usa a resposta inteira.
        const listaDeProdutos = response.data.produtos || response.data;

        // Garante que estamos sempre salvando um array no estado
        if (Array.isArray(listaDeProdutos)) {
          setTodosProdutos(listaDeProdutos);
        } else {
          console.error("A resposta da API de produtos não é um array:", response.data);
          setTodosProdutos([]); // Define como array vazio em caso de formato inesperado
        }

      } catch (error) {
        toast.error('Erro ao carregar produtos.');
        setTodosProdutos([]); // Garante que seja um array em caso de erro
      }
    };
    fetchProdutos();
  }, []);

  // Busca os dispositivos PagSeguro
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // ALTERADO: Usa a instância 'api' que envia o token
        const response = await api.get('/pagamento/pagseguro/devices');
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0].id);
        }
      } catch (error) {
        console.error("Nenhum dispositivo PagSeguro encontrado.");
      }
    };
    fetchDevices();
  }, []);

  

  const produtosFiltrados = useMemo(() => {
    if (!termoBusca) return todosProdutos; // Se a busca está vazia, mostra todos
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
    // 1. Verifica se o produto já está no carrinho para saber a quantidade atual
    const itemExistente = carrinho.find(item => item.id === produto.id);
    const quantidadeAtualNoCarrinho = itemExistente ? itemExistente.quantidade : 0;

    // 2. A NOVA VALIDAÇÃO:
    // Verifica se a quantidade que o usuário TENTARÁ colocar (a atual + 1) ultrapassa o estoque.
    if ((quantidadeAtualNoCarrinho + 1) > produto.quantidade_estoque) {
      toast.error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidade_estoque}`);
      return; // Interrompe a função e não adiciona o produto
    }
    // --- FIM DA LÓGICA DE VALIDAÇÃO ---

    // Se a validação passar, o código antigo para adicionar ao carrinho continua normalmente
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
      // MANTIDO: 'axios' global é o correto aqui, pois a rota de login é pública
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
  
  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error('Adicione pelo menos um item à venda.');
      return;
    }

    const registrarVendaNoSistema = async (metodo) => {
      const payload = {
        valor_total: totalVenda,
        metodo_pagamento: metodo,
        itens: carrinho.map(item => ({ id: item.id, nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
      };
      try {
        // ALTERADO: Usa a instância 'api' que envia o token
        await api.post('/vendas', payload);
        toast.success('Venda registrada no sistema com sucesso!');
        setCarrinho([]);
        setValorPago('');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erro ao registrar a venda no sistema.');
      }
    };

    if (metodoPagamento === 'Cartão (PagSeguro)') {
      if (!selectedDevice) {
        toast.error('Nenhum dispositivo (Tap on Phone) selecionado ou disponível.');
        return;
      }
      setPagamentoPendente(true);
      toast.info('Enviando cobrança para o dispositivo...');
      
      const payload = {
        valor_total: totalVenda,
        itens: carrinho.map(item => ({ nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
        device_id: selectedDevice,
      };

      try {
        // ALTERADO: Usa a instância 'api' que envia o token
        await api.post('/pagamento/pagseguro/order', payload);
        toast.success('Cobrança enviada! Aguarde o pagamento do cliente no celular.');
        setCarrinho([]);
        setValorPago('');
      } catch (error) {
        toast.error('Erro ao enviar cobrança para o dispositivo.');
      } finally {
        setPagamentoPendente(false);
      }
    } else {
      await registrarVendaNoSistema(metodoPagamento);
    }
  };

  const handleQuantidadeChange = (produtoId, novaQuantidade) => {
    const qtd = parseInt(novaQuantidade, 10);
    const produtoOriginal = todosProdutos.find(p => p.id === produtoId);
    
    if (isNaN(qtd) || qtd < 1) return;

    if (produtoOriginal && qtd > produtoOriginal.quantidade_estoque) {
      toast.error(`Estoque máximo para ${produtoOriginal.nome} é ${produtoOriginal.quantidade_estoque}.`);
      return;
    }

    setCarrinho(carrinhoAtual => 
      carrinhoAtual.map(item => 
        item.id === produtoId ? { ...item, quantidade: qtd } : item
      )
    );
  };

  if (loadingCaixa) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Verificando status do caixa...</Typography>
      </Box>
    );
  }

  if (caixaStatus === 'FECHADO') {
    return <ModalAberturaCaixa open={true} />;
  }
  

  return (
    <Container maxWidth="xl"> {/* Usamos 'xl' para mais espaço */}
      <Typography variant="h4" component="h1" gutterBottom>Frente de Caixa</Typography>
      <Typography variant="subtitle1" gutterBottom>Operador: {user?.nome}</Typography>
      
      {/* 2. NOVA ESTRUTURA DE LAYOUT COM GRID */}
      <Grid container spacing={3}>

        {/* --- COLUNA DA ESQUERDA (PRODUTOS) --- */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Buscar Produto por nome ou código de barras"
              variant="outlined"
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
            />
          </Paper>
          
          {/* 3. NOVA GRADE DE PRODUTOS */}
          <Paper sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {produtosFiltrados.map(produto => (
                <Grid item key={produto.id} xs={6} sm={4} md={3}>
                  <ProdutoCard 
                    produto={produto}
                    onProdutoClick={adicionarAoCarrinho} 
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* --- COLUNA DA DIREITA (VENDA) --- */}
        <Grid item xs={12} md={5}>
          {/* ITENS DA VENDA (CARRINHO) */}
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ p: 2 }}>Itens da Venda</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>Qtd.</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carrinho.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="center">
                      {/* 2. CAMPO DE QUANTIDADE SUBSTITUÍDO POR UM TEXTFIELD */}
                      <TextField
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleQuantidadeChange(item.id, e.target.value)}
                        size="small"
                        sx={{ width: '80px' }}
                        InputProps={{
                          inputProps: { 
                            min: 1, 
                            max: todosProdutos.find(p => p.id === item.id)?.quantidade_estoque 
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">R$ {Number(item.preco).toFixed(2)}</TableCell>
                    <TableCell align="right">R$ {(item.quantidade * item.preco).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => removerDoCarrinho(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        {/* Coluna da Direita: Total e Finalização */}
      <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">Total</Typography>
            <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
              R$ {totalVenda.toFixed(2)}
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Método de Pagamento</InputLabel>
              <Select
                value={metodoPagamento}
                label="Método de Pagamento"
                onChange={e => setMetodoPagamento(e.target.value)}
              >
                <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                <MenuItem value="Cartão (PagSeguro)">Cartão (Tap on Phone)</MenuItem>
                <MenuItem value="Pix">Pix</MenuItem>
              </Select>
            </FormControl>

            {metodoPagamento === 'Cartão (PagSeguro)' && (
              <FormControl fullWidth>
                <InputLabel>Dispositivo</InputLabel>
                <Select
                  value={selectedDevice}
                  label="Dispositivo"
                  onChange={e => setSelectedDevice(e.target.value)}
                  disabled={devices.length === 0}
                >
                  {devices.length > 0 ? (
                    devices.map(device => (
                      <MenuItem key={device.id} value={device.id}>{device.display_name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Nenhum dispositivo online</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
            
            {metodoPagamento === 'Dinheiro' && (
              <TextField
                label="Valor Pago"
                type="number"
                fullWidth
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
              />
            )}
            
            {troco > 0 && (
              <div>
                <Typography variant="h6">Troco</Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  R$ {troco.toFixed(2)}
                </Typography>
              </div>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth onClick={() => handleOpenMovimentacaoModal('SANGRIA')}>
                    Registrar Sangria
                </Button>
                <Button variant="outlined" fullWidth onClick={() => handleOpenMovimentacaoModal('SUPRIMENTO')}>
                    Registrar Suprimento
                </Button>
            </Stack>

            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || pagamentoPendente}
              sx={{ mt: 2, p: 2, fontSize: '1.2rem' }}
            >
              {pagamentoPendente ? 'Aguardando...' : 'Finalizar Venda'}
            </Button>
        </Paper>
      </Grid>
      </Grid>
      <ManagerOverrideDialog
        open={overrideDialogOpen}
        onClose={() => setOverrideDialogOpen(false)}
        onConfirm={handleManagerAuthorize}
        error={overrideError}
      />
      <ModalMovimentacaoCaixa
        open={modalMovimentacaoOpen}
        onClose={handleCloseMovimentacaoModal}
        tipo={tipoMovimentacao}
      />
    </Container>
  );
}

export default FrenteDeCaixa;