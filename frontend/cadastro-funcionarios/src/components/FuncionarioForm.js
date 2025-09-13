// src/components/FuncionarioForm.js (VERSÃO COM MUI)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Grid, Paper, Stack } from '@mui/material';
import { toast } from 'react-toastify';

const FuncionarioForm = ({ onCadastroSucesso, funcionarioParaEditar, limparEdicao }) => {
  const [formData, setFormData] = useState({
    nome: '', cargo: '', email: '', senha: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (funcionarioParaEditar) {
      setFormData({
        nome: funcionarioParaEditar.nome,
        cargo: funcionarioParaEditar.cargo,
        email: funcionarioParaEditar.email,
        senha: '',
      });
      setIsEditing(true);
      
    } else {
      setFormData({ nome: '', cargo: '', email: '', senha: '' });
      setIsEditing(false);
    }
  }, [funcionarioParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing
      ? `http://localhost:3333/api/funcionarios/${funcionarioParaEditar.id}`
      : 'http://localhost:3333/api/funcionarios';
    const method = isEditing ? 'put' : 'post';
    
    const dataToSend = { ...formData };
    if (isEditing && !dataToSend.senha) {
      delete dataToSend.senha;
    }

    try {
      const response = await axios[method](url, dataToSend);
      // Use o toast.success
      toast.success(`Funcionário "${response.data.nome}" ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      limparFormulario();
      if (onCadastroSucesso) onCadastroSucesso();
    } catch (error) {
      const errorMsg = error.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'}.`;
      // Use o toast.error
      toast.error(errorMsg);
    }
  };

  const limparFormulario = () => {
    setFormData({ nome: '', cargo: '', email: '', senha: '' });
    if(isEditing) limparEdicao();
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="nome"
              label="Nome Completo"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="cargo"
              label="Cargo"
              value={formData.cargo}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="senha"
              label={isEditing ? 'Nova Senha (opcional)' : 'Senha'}
              type="password"
              value={formData.senha}
              onChange={handleChange}
              fullWidth
              required={!isEditing}
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

export default FuncionarioForm;