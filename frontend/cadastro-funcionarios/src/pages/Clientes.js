// frontend/src/pages/Clientes.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
// 1. ADICIONE OS IMPORTS QUE FALTAVAM AQUI
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Box, Pagination, CircularProgress, Button, Tabs, Tab 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import do ícone de voltar
import ClienteForm from '../components/ClienteForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ExtratoCliente from '../components/ExtratoCliente'; 

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState('list'); // 'list' ou 'details'
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [aba, setAba] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClientes = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      const response = await api.get('/clientes', { params: { page: currentPage } });
      setClientes(response.data.clientes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) { 
      toast.error('Erro ao carregar clientes.'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    if (view === 'list') {
      fetchClientes(page);
    }
  }, [view, page, fetchClientes]);

  const handleSucessoForm = async (data, isEditing) => {
    try {
      if (isEditing) {
        await api.put(`/clientes/${clienteSelecionado.id}`, data);
        toast.success('Cliente atualizado com sucesso!');
        setClienteSelecionado({ ...clienteSelecionado, ...data });
      } else {
        const response = await api.post('/clientes', data);
        toast.success('Cliente cadastrado com sucesso!');
        handleVerDetalhes(response.data);
      }
    } catch (error) { 
      toast.error(error.response?.data?.error || 'Erro ao salvar cliente.'); 
    }
  };

  const handleVerDetalhes = (cliente) => {
    setClienteSelecionado(cliente);
    setView('details');
  };

  const handleVoltarParaLista = () => {
    setView('list');
    setClienteSelecionado(null);
    // A lista será atualizada pelo useEffect
  };
  
  const handleDeleteClick = (cliente) => { 
    setClienteParaDeletar(cliente); 
    setDialogOpen(true); 
  };
  
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${clienteParaDeletar.id}`);
      toast.success('Cliente deletado com sucesso!');
      // Se a tela de detalhes estiver aberta, volta para a lista
      if (view === 'details') {
        handleVoltarParaLista();
      } else {
        fetchClientes(page);
      }
    } catch (error) {
      toast.error('Erro ao deletar cliente.');
    } finally {
      setDialogOpen(false);
      setClienteParaDeletar(null);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

 if (view === 'details') {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVoltarParaLista} sx={{ mb: 2 }}>
          Voltar para a Lista de Clientes
        </Button>
        <Typography variant="h4" gutterBottom>Detalhes de {clienteSelecionado.nome}</Typography>
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={aba} onChange={(e, newValue) => setAba(newValue)} variant="fullWidth">
              <Tab label="Dados Cadastrais" />
              <Tab label="Extrato de Débitos" />
            </Tabs>
          </Box>
          <Box sx={{ p: 3 }}>
            {aba === 0 && <ClienteForm onSucesso={handleSucessoForm} clienteParaEditar={clienteSelecionado} limparEdicao={() => {}} />}
            {aba === 1 && <ExtratoCliente clienteId={clienteSelecionado.id} />}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestão de Clientes</Typography>
      <ClienteForm onSucesso={handleSucessoForm} />
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
                  <TableRow key={cliente.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleVerDetalhes(cliente)}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleVerDetalhes(cliente); }}><EditIcon /></IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteClick(cliente); }}><DeleteIcon color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" /></Box> )}
        </>
      )}
      <ConfirmDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" description={`Tem certeza que deseja excluir o cliente "${clienteParaDeletar?.nome}"?`} />
    </Box>
  );
};

export default Clientes;