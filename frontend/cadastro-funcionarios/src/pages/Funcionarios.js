// src/pages/Funcionarios.js (VERSÃO COM NOVO DESIGN)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FuncionarioForm from '../components/FuncionarioForm';
import ListaFuncionarios from '../components/ListaFuncionarios';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography, Box, Pagination, Paper, Divider } from '@mui/material';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFuncionarios = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/funcionarios', { params: { page: currentPage } });
      setFuncionarios(response.data.funcionarios);
      setTotalPages(response.data.totalPages);
      setPage(currentPage);
    } catch (err) {
      toast.error('Falha ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFuncionarios(page);
  }, [page]);

  const handleSuccess = () => {
    // Se estava editando, mantém a página. Se cadastrou um novo, vai para a primeira página.
    const pageToFetch = funcionarioParaEditar ? page : 1;
    fetchFuncionarios(pageToFetch);
    setFuncionarioParaEditar(null);
  };

  const handlePageChange = (event, value) => { setPage(value); };

  const handleEdit = (funcionario) => {
    setFuncionarioParaEditar(funcionario);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para ver o form
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
      await api.delete(`/funcionarios/${funcionarioParaDeletar}`);
      toast.success('Funcionário excluído com sucesso!');
      // Recarrega os funcionários da página atual
      fetchFuncionarios(page);
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

      <Paper elevation={3} sx={{ mb: 4 }}>
        <FuncionarioForm 
          onCadastroSucesso={handleSuccess}
          funcionarioParaEditar={funcionarioParaEditar}
          limparEdicao={handleCancelEdit}
        />
        <Divider />
        <ListaFuncionarios 
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          funcionarios={funcionarios}
          loading={loading}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
      
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