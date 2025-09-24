// frontend/src/pages/Clientes.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Box, Pagination, CircularProgress, Button, Tabs, Tab,
  Grid, TextField, FormControlLabel, Switch, Tooltip // 1. IMPORTE O Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// 2. IMPORTE OS NOVOS ÍCONES
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ClienteForm from '../components/ClienteForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ExtratoCliente from '../components/ExtratoCliente'; 

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState('list');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [aba, setAba] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({ nome: '', comDebitos: false });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      // Envia os filtros e a página para a API
      const response = await api.get('/clientes', { params: { page, ...filtrosAtivos } });
      setClientes(response.data.clientes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) { 
      toast.error('Erro ao carregar clientes.'); 
    } finally { 
      setLoading(false); 
    }
  }, [page, filtrosAtivos]);

  useEffect(() => {
    // Debounce: espera 300ms após o usuário parar de digitar para fazer a busca
    const timerId = setTimeout(() => {
        if (view === 'list') {
            fetchClientes();
        }
    }, 300);
    return () => clearTimeout(timerId);
  }, [view, page, filtrosAtivos, fetchClientes]);

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

  const handleVerDetalhes = (cliente, abaInicial = 0) => {
    setClienteSelecionado(cliente);
    setAba(abaInicial); // Define a aba inicial
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
  
  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prevFiltros => ({
        ...prevFiltros,
        [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAplicarFiltros = () => {
    setPage(1); // Sempre volta para a primeira página ao filtrar
    setFiltrosAtivos(filtros);
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
      
      {/* PAINEL DE FILTROS */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
                <TextField 
                    name="nome" 
                    label="Buscar por nome..." 
                    value={filtros.nome}
                    onChange={handleFiltroChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleAplicarFiltros()}
                    fullWidth 
                    size="small" 
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={filtros.comDebitos} 
                            onChange={handleFiltroChange} 
                            name="comDebitos"
                        />
                    }
                    label="Mostrar apenas com débitos"
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Buscar</Button>
            </Grid>
        </Grid>
      </Paper>

      {loading ? <CircularProgress /> : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="right">Saldo Devedor</TableCell> {/* NOVA COLUNA */}
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id} hover>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: cliente.saldo_devedor > 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(cliente.saldo_devedor)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar Dados Cadastrais">
                        {/* Chama a função para abrir na aba 0 (Dados) */}
                        <IconButton onClick={() => handleVerDetalhes(cliente, 0)}>
                          <ManageAccountsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Extrato de Débitos">
                        {/* Chama a função para abrir na aba 1 (Extrato) */}
                        <IconButton onClick={() => handleVerDetalhes(cliente, 1)} color="primary">
                          <ReceiptLongIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir Cliente">
                        <IconButton onClick={() => handleDeleteClick(cliente)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" /></Box> )}
        </>
      )}
      <ConfirmDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" description={`Tem certeza que deseja excluir o cliente "${clienteParaDeletar?.nome}"?`} />
    </Box>
  );
};

export default Clientes;
