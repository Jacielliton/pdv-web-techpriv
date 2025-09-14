// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\FrenteDeCaixa.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import ManagerOverrideDialog from '../components/ManagerOverrideDialog';
import QRCode from 'qrcode.react'; // Importe a biblioteca do QR Code
import { Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material'; // Importe o Dialog

import { 
  Container, Typography, Grid, TextField, List, ListItem, ListItemButton, ListItemText,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';




function FrenteDeCaixa() {
  const { user, isManager } = useAuth();
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [overrideError, setOverrideError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [pagamentoPendente, setPagamentoPendente] = useState(false);

  // 1. NOVOS ESTADOS PARA VALOR PAGO E TROCO
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);

  // Busca a lista de maquininhas disponíveis ao carregar
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/pagamento/pagseguro/devices');
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0].id); // Seleciona a primeira por padrão
        }
      } catch (error) {
        toast.error('Não foi possível encontrar maquininhas conectadas.');
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/produtos');
        setTodosProdutos(response.data);
      } catch (error) {
        toast.error('Erro ao carregar produtos.');
      }
    };
    fetchProdutos();
  }, []);

  const produtosFiltrados = useMemo(() => {
    if (termoBusca.length < 2) return [];
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
  

  const adicionarAoCarrinho = (produto) => {
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
    // Se o usuário atual já for gerente, remove direto
    if (isManager) {
      setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== produtoId));
      toast.info('Item removido pelo gerente.');
    } else {
      // Se não for gerente, abre o diálogo de autorização
      setItemParaRemover(produtoId);
      setOverrideDialogOpen(true);
      setOverrideError(''); // Limpa erros anteriores
    }
  };

  // 4. Crie a função para lidar com a confirmação do gerente
  const handleManagerAuthorize = async (email, senha) => {
    try {
      const response = await axios.post('http://localhost:3333/api/login', { email, senha });

      // Verifica se o login foi bem-sucedido E se o usuário é um gerente
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
  
  const [qrCodeText, setQrCodeText] = useState('');
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false);

  const finalizarVenda = async () => {
    if (carrinho.length === 0) { /* ... */ }

    if (metodoPagamento === 'Cartão (PagSeguro)') {
      if (!selectedDevice) {
        toast.error('Selecione uma maquininha para continuar.');
        return;
      }
      setPagamentoPendente(true);
      toast.info('Enviando cobrança para a maquininha...');
      
      const payload = {
        valor_total: totalVenda,
        itens: carrinho.map(item => ({ nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
        device_id: selectedDevice, // Envia o ID da maquininha selecionada
      };

      try {
        await axios.post('http://localhost:3333/api/pagamento/pagseguro/order', payload);
        // A confirmação agora vem pelo Webhook no backend.
        // O frontend pode apenas aguardar e limpar o carrinho.
        toast.success('Cobrança enviada! Aguarde o pagamento do cliente.');
        setCarrinho([]);
      } catch (error) {
        toast.error('Erro ao enviar cobrança para a maquininha.');
      } finally {
        setPagamentoPendente(false);
      }
    } else {
      // Lógica para outros pagamentos
    }
  };

   // NOVA FUNÇÃO PARA ATUALIZAR A QUANTIDADE
  const handleQuantidadeChange = (produtoId, novaQuantidade) => {
    const qtd = parseInt(novaQuantidade, 10);
    
    // Encontra o produto original para checar o estoque máximo
    const produtoOriginal = todosProdutos.find(p => p.id === produtoId);
    
    // Validação: não permite quantidade menor que 1 ou não-numérica
    if (isNaN(qtd) || qtd < 1) {
      return;
    }

    // Validação: não permite quantidade maior que o estoque
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>Frente de Caixa</Typography>
      <Typography variant="subtitle1">Operador: {user?.nome}</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        
        {/* Coluna da Esquerda: Busca e Carrinho */}
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Adicionar Produto</Typography>
            <TextField
              fullWidth
              label="Digite o nome ou código de barras"
              variant="outlined"
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
              sx={{ mt: 2 }}
            />
            {produtosFiltrados.length > 0 && (
              <Paper sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                <List>
                  {produtosFiltrados.map(p => (
                    <ListItem button key={p.id} onClick={() => adicionarAoCarrinho(p)}>
                      <ListItemText primary={p.nome} secondary={`R$ ${Number(p.preco).toFixed(2)} | Estoque: ${p.quantidade_estoque}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Paper>
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
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
          
          <FormControl fullWidth sx={{ mt: 2 }}>
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
              {/* Adicione a opção do PagSeguro aqui */}
              <MenuItem value="Cartão (PagSeguro)">Cartão (PagSeguro)</MenuItem> 
            </Select>
          </FormControl>

          {/* O seletor da maquininha fica FORA e abaixo do seletor de pagamento */}
            {metodoPagamento === 'Cartão (PagSeguro)' && (
              <FormControl fullWidth>
                <InputLabel>Maquininha</InputLabel>
                <Select
                  value={selectedDevice}
                  label="Maquininha"
                  onChange={e => setSelectedDevice(e.target.value)}
                  disabled={devices.length === 0}
                >
                  {devices.map(device => (
                    <MenuItem key={device.id} value={device.id}>{device.display_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          

          {/* 3. NOVO TEXTFIELD PARA O "VALOR PAGO" */}
          {metodoPagamento === 'Dinheiro' && (
            <TextField
              label="Valor Pago"
              type="number"
              fullWidth
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
              }}
            />
          )}

          {/* 4. EXIBIÇÃO DO TROCO CALCULADO */}
          {troco > 0 && (
            <div>
              <Typography variant="h6">Troco</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'blue' }}>
                R$ {troco.toFixed(2)}
              </Typography>
            </div>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={finalizarVenda}
            disabled={carrinho.length === 0 || pagamentoPendente}
            sx={{ mt: 2, p: 2, fontSize: '1.2rem' }}
          >
            Finalizar Venda
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
    </Container>
  );
}

export default FrenteDeCaixa;