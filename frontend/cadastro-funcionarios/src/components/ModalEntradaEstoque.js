// frontend/src/components/ModalEntradaEstoque.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ModalEntradaEstoque = ({ open, onClose, produto, onSucesso }) => {
  const [quantidade, setQuantidade] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    if (open) {
      // Carrega a lista de fornecedores para o dropdown
      const fetchFornecedores = async () => {
        try {
          const response = await api.get('/fornecedores');
          setFornecedores(response.data.fornecedores || []);
        } catch (error) { toast.error('Erro ao carregar fornecedores.'); }
      };
      fetchFornecedores();
      // Sugere o último preço de custo cadastrado
      setPrecoCusto(produto?.preco_custo || ''); 
    }
  }, [open, produto]);

  const handleSubmit = async () => {
    try {
      await api.post('/estoque/entrada', {
        produto_id: produto.id,
        quantidade: parseInt(quantidade, 10),
        preco_custo_unitario: parseFloat(precoCusto),
        fornecedor_id: fornecedorId || null
      });
      toast.success('Entrada de estoque registrada com sucesso!');
      onSucesso(); // Atualiza a lista de produtos na página
      handleClose();
    } catch (error) { toast.error(error.response?.data?.error || 'Erro ao registrar entrada.'); }
  };

  const handleClose = () => {
    setQuantidade('');
    setPrecoCusto('');
    setFornecedorId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Registrar Entrada de Estoque para: {produto?.nome}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} autoFocus required />
        <TextField label="Preço de Custo por Unidade (R$)" type="number" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} required />
        <FormControl fullWidth>
          <InputLabel>Fornecedor (Opcional)</InputLabel>
          <Select value={fornecedorId} label="Fornecedor (Opcional)" onChange={(e) => setFornecedorId(e.target.value)}>
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            {fornecedores.map(f => <MenuItem key={f.id} value={f.id}>{f.nome_fantasia}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions><Button onClick={handleClose}>Cancelar</Button><Button onClick={handleSubmit} variant="contained">Confirmar</Button></DialogActions>
    </Dialog>
  );
};
export default ModalEntradaEstoque;