// src/components/ProdutoForm.js (VERSÃO FINAL COM AUTOCOMPLETE)
import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  TextField, Button, Box, Typography, Grid, Paper, Stack, CircularProgress, 
  IconButton, Tooltip, InputAdornment // InputAdornment importado
} from '@mui/material';
import { toast } from 'react-toastify';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search'; // Ícone para o campo de seleção
import SelecaoEntidadeModal from './SelecaoEntidadeModal'; // 1. Importa o novo modal

const ProdutoForm = ({ onSucesso, produtoParaEditar, limparEdicao, onAbrirGerenciador }) => {

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
   const [grupos, setGrupos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // 2. Novo estado para controlar o modal de seleção
  const [selecaoModal, setSelecaoModal] = useState({ open: false, tipo: '' });


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
      limparFormulario();
    }
  }, [produtoParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const limparFormulario = () => {
    setFormData({ nome: '', descricao: '', preco: '', quantidade_estoque: '', codigo_barras: '', estoque_minimo: '', grupo_id: '', categoria_id: '' });
    if (isEditing) limparEdicao();
  };

  const handleSelecionarEntidade = (item) => {
    const { tipo } = selecaoModal;
    if (tipo === 'Grupo') {
      setFormData({ ...formData, grupo_id: item.id });
    } else if (tipo === 'Categoria') {
      setFormData({ ...formData, categoria_id: item.id });
    }
  };

  // 4. Funções para encontrar os nomes dos itens selecionados
  const nomeGrupoSelecionado = useMemo(() => grupos.find(g => g.id === formData.grupo_id)?.nome || '', [grupos, formData.grupo_id]);
  const nomeCategoriaSelecionada = useMemo(() => categorias.find(c => c.id === formData.categoria_id)?.nome || '', [categorias, formData.categoria_id]);

  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* ... (outros TextFields: nome, preco, etc.) ... */}
            <Grid item xs={12} sm={6}> <TextField name="nome" label="Nome do Produto *" value={formData.nome} onChange={handleChange} fullWidth required /> </Grid>
            <Grid item xs={12} sm={6}> <TextField name="preco" label="Preço (ex: 10.50) *" type="number" value={formData.preco} onChange={handleChange} fullWidth required /> </Grid>
            <Grid item xs={12} sm={6}> <TextField name="quantidade_estoque" label="Quantidade em Estoque..." type="number" value={formData.quantidade_estoque} onChange={handleChange} fullWidth required /> </Grid>
            <Grid item xs={12} sm={6}> <TextField name="estoque_minimo" label="Estoque Mínimo (Alerta) *" type="number" value={formData.estoque_minimo} onChange={handleChange} fullWidth required helperText="Alerta será gerado quando o estoque atingir este valor."/> </Grid>
            
            {/* =================================================================== */}
            {/* ALTERAÇÃO: Campo de GRUPO agora é um TextField que abre um modal  */}
            {/* =================================================================== */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Grupo"
                  value={nomeGrupoSelecionado}
                  onClick={() => setSelecaoModal({ open: true, tipo: 'Grupo' })}
                  fullWidth
                  InputProps={{
                    readOnly: true, // Impede a digitação direta
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tooltip title="Gerenciar Grupos">
                  <IconButton onClick={() => onAbrirGerenciador('Grupo')} color="primary">
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* =================================================================== */}
            {/* ALTERAÇÃO: Campo de CATEGORIA agora é um TextField que abre um modal*/}
            {/* =================================================================== */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Categoria"
                  value={nomeCategoriaSelecionada}
                  onClick={() => setSelecaoModal({ open: true, tipo: 'Categoria' })}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tooltip title="Gerenciar Categorias">
                  <IconButton onClick={() => onAbrirGerenciador('Categoria')} color="primary">
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}> <TextField name="codigo_barras" label="Código de Barras (opcional)" value={formData.codigo_barras} onChange={handleChange} fullWidth /> </Grid>
            <Grid item xs={12} sm={6}> <TextField name="descricao" label="Descrição (opcional)" value={formData.descricao} onChange={handleChange} fullWidth multiline rows={1} /> </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Atualizar' : 'Cadastrar')}
            </Button>
            {isEditing && ( <Button variant="outlined" onClick={limparFormulario} disabled={isLoading}> Cancelar Edição </Button> )}
          </Stack>       
        </Box>
      </Paper>

      {/* 5. Renderização do novo modal de seleção */}
      <SelecaoEntidadeModal
        open={selecaoModal.open}
        onClose={() => setSelecaoModal({ open: false, tipo: '' })}
        tipo={selecaoModal.tipo}
        itens={selecaoModal.tipo === 'Grupo' ? grupos : categorias}
        onSelecionar={handleSelecionarEntidade}
      />
    </>
  );
};

export default ProdutoForm;