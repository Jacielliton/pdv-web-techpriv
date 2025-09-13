// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\FrenteDeCaixa.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/auth';
import { toast } from 'react-toastify';
import { 
  Container, Typography, Grid, TextField, List, ListItem, ListItemText, // <-- Adicionado aqui
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function FrenteDeCaixa() {
  const { user } = useAuth();
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro');

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
    setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.id !== produtoId));
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
      await axios.post('http://localhost:3333/api/vendas', payload);
      toast.success('Venda finalizada com sucesso!');
      setCarrinho([]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao finalizar venda.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>Frente de Caixa</Typography>
      <Typography variant="subtitle1">Operador: {user?.nome}</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        
        {/* Coluna da Esquerda: Busca e Carrinho */}
        <Grid item xs={12} md={7}>
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
                  <TableCell align="center">Qtd.</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carrinho.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="center">{item.quantidade}</TableCell>
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
              <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
              <Select
                labelId="payment-method-label"
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
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={finalizarVenda}
              disabled={carrinho.length === 0}
              sx={{ mt: 2, p: 2, fontSize: '1.2rem' }}
            >
              Finalizar Venda
            </Button>
            
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FrenteDeCaixa;