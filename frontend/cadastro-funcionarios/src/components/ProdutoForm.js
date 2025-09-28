// src/components/ProdutoForm.js (VERSÃO COM MUI)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TextField, Button, Box, Typography, Grid, Paper, Stack, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { InputLabel, Select, MenuItem, FormControl } from '@mui/material';

const ProdutoForm = ({ onSucesso, produtoParaEditar, limparEdicao }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
    codigo_barras: '',
    estoque_minimo: '',
    grupo_id: '',       
    categoria_id: '',
  });  
  // ADIÇÃO: Estados para armazenar as listas de grupos e categorias
  const [grupos, setGrupos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ADIÇÃO: Efeito para buscar grupos e categorias quando o componente montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gruposRes, categoriasRes] = await Promise.all([
          api.get('/grupos'),
          api.get('/categorias'),
        ]);
        setGrupos(gruposRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        toast.error('Erro ao carregar grupos e categorias.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (produtoParaEditar) {
      setFormData({
        nome: produtoParaEditar.nome,
        descricao: produtoParaEditar.descricao || '',
        preco: produtoParaEditar.preco,
        quantidade_estoque: produtoParaEditar.quantidade_estoque,
        codigo_barras: produtoParaEditar.codigo_barras || '',
        estoque_minimo: produtoParaEditar.estoque_minimo || 10, 
        grupo_id: produtoParaEditar.grupo_id || '',         
        categoria_id: produtoParaEditar.categoria_id || '',   
      });
      setIsEditing(true);
      
    } else {
      setFormData({ nome: '', descricao: '', preco: '', quantidade_estoque: '', codigo_barras: '', estoque_minimo: '', grupo_id: '', categoria_id: '' });
      setIsEditing(false);
    }
  }, [produtoParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Ativa o loading
    
    const url = isEditing ? `/produtos/${produtoParaEditar.id}` : '/produtos';
    const method = isEditing ? 'put' : 'post';

    try {
      await api[method](url, formData);
      toast.success(`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      limparFormulario();
      if (onSucesso) onSucesso();
    } catch (error) {
      const errorMsg = error.response?.data?.details?.[0] || error.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'}.`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false); // Desativa o loading no final, mesmo se der erro
    }
  };

  const limparFormulario = () => {
    setFormData({ nome: '', descricao: '', preco: '', quantidade_estoque: '', codigo_barras: '', estoque_minimo: '' });
    if (isEditing) limparEdicao();
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              name="nome"
              label="Nome do Produto"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid xs={12} sm={6}>
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
          <Grid xs={12} sm={6}>
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

          {/* CAMPO DE ESTOQUE MÍNIMO */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="estoque_minimo"
              label="Estoque Mínimo (Alerta)"
              type="number"
              value={formData.estoque_minimo}
              onChange={handleChange}
              fullWidth
              required
              helperText="Alerta será gerado quando o estoque atingir este valor."
            />
          </Grid>

          {/* ADIÇÃO: Campos de Select para Grupo e Categoria */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Grupo</InputLabel>
              <Select
                name="grupo_id"
                value={formData.grupo_id}
                label="Grupo"
                onChange={handleChange}
              >
                <MenuItem value=""><em>Nenhum</em></MenuItem>
                {grupos.map((grupo) => (
                  <MenuItem key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoria_id"
                value={formData.categoria_id}
                label="Categoria"
                onChange={handleChange}
              >
                <MenuItem value=""><em>Nenhuma</em></MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <TextField
              name="codigo_barras"
              label="Código de Barras (opcional)"
              value={formData.codigo_barras}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
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
          {/* 3. ATUALIZAR O BOTÃO */}
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Atualizar' : 'Cadastrar')}
          </Button>
          {isEditing && (
            <Button variant="outlined" onClick={limparFormulario} disabled={isLoading}>
              Cancelar Edição
            </Button>
          )}
        </Stack>       
      </Box>
    </Paper>
  );
};

export default ProdutoForm;