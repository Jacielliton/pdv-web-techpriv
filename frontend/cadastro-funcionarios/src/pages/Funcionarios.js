// src/pages/Funcionarios.js (VERSÃO COM MUI)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FuncionarioForm from '../components/FuncionarioForm';
import ListaFuncionarios from '../components/ListaFuncionarios';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography } from '@mui/material';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);

  const fetchFuncionarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3333/api/funcionarios');
      setFuncionarios(response.data);
    } catch (err) {
      setError('Falha ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const handleSuccess = () => {
    fetchFuncionarios();
    setFuncionarioParaEditar(null);
  };

  const handleEdit = (funcionario) => {
    setFuncionarioParaEditar(funcionario);
  };
  
  const handleCancelEdit = () => {
    setFuncionarioParaEditar(null);
  }

  const handleDeleteRequest = (id) => {
    setFuncionarioParaDeletar(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3333/api/funcionarios/${funcionarioParaDeletar}`);
      toast.success('Funcionário excluído com sucesso!');
      fetchFuncionarios();
    } catch (err) {
      toast.error('Erro ao excluir funcionário.');
    } finally {
      setDialogOpen(false);
      setFuncionarioParaDeletar(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Funcionários
      </Typography>
      <FuncionarioForm 
        onCadastroSucesso={handleSuccess}
        funcionarioParaEditar={funcionarioParaEditar}
        limparEdicao={handleCancelEdit}
      />
      <ListaFuncionarios 
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
        funcionarios={funcionarios}
        loading={loading}
        error={error}
      />
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este funcionário?"
      />
    </Container>
  );
}

export default Funcionarios;