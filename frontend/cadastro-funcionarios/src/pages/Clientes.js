// frontend/src/pages/Clientes.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, Pagination, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClienteForm from '../components/ClienteForm';
import ConfirmDialog from '../components/ConfirmDialog';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // A função de busca agora está dentro do useEffect para maior estabilidade
  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/clientes', { params: { page } });
        setClientes(response.data.clientes || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        toast.error('Erro ao carregar clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [page]); // O efeito agora depende diretamente de 'page'

  const handleSucesso = async (data, isEditing) => {
    try {
      if (isEditing) {
        await api.put(`/clientes/${clienteParaEditar.id}`, data);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clientes', data);
        toast.success('Cliente cadastrado com sucesso!');
      }
      limparEdicao();
      
      // CORREÇÃO: Apenas resetamos a página. O useEffect cuidará do resto.
      if (page !== 1) {
        setPage(1);
      } else {
        // Se já estamos na página 1, precisamos forçar uma re-busca.
        // A forma mais limpa é refatorar um pouco, mas vamos manter simples por enquanto
        const response = await api.get('/clientes', { params: { page: 1 } });
        setClientes(response.data.clientes || []);
        setTotalPages(response.data.totalPages || 1);
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar cliente.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${clienteParaDeletar.id}`);
      toast.success('Cliente deletado com sucesso!');
      
      // CORREÇÃO: Apenas buscamos os dados novamente
      const response = await api.get('/clientes', { params: { page } });
      setClientes(response.data.clientes || []);
      setTotalPages(response.data.totalPages || 1);

    } catch (error) {
      toast.error('Erro ao deletar cliente.');
    } finally {
      setDialogOpen(false);
      setClienteParaDeletar(null);
    }
  };

  const handleEditar = (cliente) => {
    setClienteParaEditar(cliente);
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = (cliente) => {
    setClienteParaDeletar(cliente);
    setDialogOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const limparEdicao = () => setClienteParaEditar(null);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestão de Clientes</Typography>
      <ClienteForm onSucesso={handleSucesso} clienteParaEditar={clienteParaEditar} limparEdicao={limparEdicao} />
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Clientes Cadastrados</Typography>
      {loading ? <CircularProgress /> : (
        <>
          <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{cliente.cpf}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEditar(cliente)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteClick(cliente)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
               </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 6. RENDERIZA O COMPONENTE DE PAGINAÇÃO */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o cliente "${clienteParaDeletar?.nome}"?`}
      />
    </Box>
  );
};

export default Clientes;