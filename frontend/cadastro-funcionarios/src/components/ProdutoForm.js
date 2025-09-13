// src/components/ProdutoForm.js (VERSÃO COM MUI)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Grid, Paper, Stack } from '@mui/material';
import { toast } from 'react-toastify';

const ProdutoForm = ({ onSucesso, produtoParaEditar, limparEdicao }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
    codigo_barras: '',
  });  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (produtoParaEditar) {
      setFormData({
        nome: produtoParaEditar.nome,
        descricao: produtoParaEditar.descricao || '',
        preco: produtoParaEditar.preco,
        quantidade_estoque: produtoParaEditar.quantidade_estoque,
        codigo_barras: produtoParaEditar.codigo_barras || '',
      });
      setIsEditing(true);
      
    } else {
      setFormData({ nome: '', descricao: '', preco: '', quantidade_estoque: '', codigo_barras: '' });
      setIsEditing(false);
    }
  }, [produtoParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing
      ? `http://localhost:3333/api/produtos/${produtoParaEditar.id}`
      : 'http://localhost:3333/api/produtos';
    const method = isEditing ? 'put' : 'post';

    try {
      await axios[method](url, formData);
      toast.success(`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      limparFormulario();
      if (onSucesso) onSucesso();
    } catch (error) {
      const errorMsg = error.response?.data?.details?.[0] || error.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'}.`;
      toast.error(errorMsg);
    }
  };

  const limparFormulario = () => {
    setFormData({ nome: '', descricao: '', preco: '', quantidade_estoque: '', codigo_barras: '' });
    if (isEditing) limparEdicao();
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="nome"
              label="Nome do Produto"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="preco"
              label="Preço (ex: 10.50)"
              type="number"
              value={formData.preco}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="quantidade_estoque"
              label="Quantidade em Estoque"
              type="number"
              value={formData.quantidade_estoque}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="codigo_barras"
              label="Código de Barras (opcional)"
              value={formData.codigo_barras}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="descricao"
              label="Descrição (opcional)"
              value={formData.descricao}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained">
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {isEditing && (
            <Button variant="outlined" onClick={limparFormulario}>
              Cancelar Edição
            </Button>
          )}
        </Stack>        
      </Box>
    </Paper>
  );
};

export default ProdutoForm;