import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, Paper, Stack, Typography } from '@mui/material';

const FornecedorForm = ({ onSucesso, fornecedorParaEditar, limparEdicao }) => {
  const [formData, setFormData] = useState({ nome_fantasia: '', razao_social: '', cnpj: '', telefone: '', email: '', endereco: '' });
  const isEditing = !!fornecedorParaEditar;

  useEffect(() => {
    if (fornecedorParaEditar) {
      setFormData(fornecedorParaEditar);
    } else {
      setFormData({ nome_fantasia: '', razao_social: '', cnpj: '', telefone: '', email: '', endereco: '' });
    }
  }, [fornecedorParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSucesso(formData, isEditing); };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>{isEditing ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField name="nome_fantasia" label="Nome Fantasia" value={formData.nome_fantasia} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField name="razao_social" label="Razão Social" value={formData.razao_social} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="cnpj" label="CNPJ" value={formData.cnpj} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="endereco" label="Endereço" value={formData.endereco} onChange={handleChange} fullWidth /></Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained">{isEditing ? 'Atualizar' : 'Cadastrar'}</Button>
          {isEditing && (<Button variant="outlined" onClick={limparEdicao}>Cancelar Edição</Button>)}
        </Stack>
      </Box>
    </Paper>
  );
};
export default FornecedorForm;