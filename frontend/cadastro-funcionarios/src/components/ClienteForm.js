// frontend/src/components/ClienteForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, Paper, Stack, CircularProgress } from '@mui/material';

const ClienteForm = ({ onSucesso, clienteParaEditar, limparEdicao }) => {
  const [formData, setFormData] = useState({ nome: '', cpf: '', telefone: '', email: '', endereco: '' });
  const isEditing = !!clienteParaEditar;

  useEffect(() => {
    if (clienteParaEditar) {
      setFormData(clienteParaEditar);
    } else {
      setFormData({ nome: '', cpf: '', telefone: '', email: '', endereco: '' });
    }
  }, [clienteParaEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSucesso(formData, isEditing); // Chama a função do componente pai para salvar/editar
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField name="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField name="cpf" label="CPF" value={formData.cpf} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField name="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12}><TextField name="endereco" label="Endereço" value={formData.endereco} onChange={handleChange} fullWidth /></Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained">{isEditing ? 'Atualizar' : 'Cadastrar'}</Button>
          {isEditing && (<Button variant="outlined" onClick={limparEdicao}>Cancelar Edição</Button>)}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ClienteForm;