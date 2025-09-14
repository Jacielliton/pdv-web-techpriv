// src/pages/Funcionarios.js

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ALTERADO: Importa a instância 'api'
import FuncionarioForm from '../components/FuncionarioForm';
import ListaFuncionarios from '../components/ListaFuncionarios';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography } from '@mui/material';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      // ALTERADO: Usa 'api' e a URL relativa
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
    } catch (err) {
      toast.error('Falha ao carregar funcionários.');
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
      // ALTERADO: Usa 'api' e a URL relativa
      await api.delete(`/funcionarios/${funcionarioParaDeletar}`);
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