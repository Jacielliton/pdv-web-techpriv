import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FornecedorForm from '../components/FornecedorForm';
import ConfirmDialog from '../components/ConfirmDialog';

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorParaEditar, setFornecedorParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fornecedorParaDeletar, setFornecedorParaDeletar] = useState(null);

  const fetchFornecedores = useCallback(async () => {
    try {
      const response = await api.get('/fornecedores');
      setFornecedores(response.data.fornecedores || []);
    } catch (error) { toast.error('Erro ao carregar fornecedores.'); }
  }, []);

  useEffect(() => { fetchFornecedores(); }, [fetchFornecedores]);

  const handleSucesso = async (data, isEditing) => {
    try {
      if (isEditing) {
        await api.put(`/fornecedores/${fornecedorParaEditar.id}`, data);
        toast.success('Fornecedor atualizado!');
      } else {
        await api.post('/fornecedores', data);
        toast.success('Fornecedor cadastrado!');
      }
      setFornecedorParaEditar(null);
      fetchFornecedores();
    } catch (error) { toast.error(error.response?.data?.error || 'Erro ao salvar fornecedor.'); }
  };
  
  const handleEditar = (fornecedor) => setFornecedorParaEditar(fornecedor);
  const handleDeleteClick = (fornecedor) => { setFornecedorParaDeletar(fornecedor); setDialogOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/fornecedores/${fornecedorParaDeletar.id}`);
      toast.success('Fornecedor deletado!');
      fetchFornecedores();
    } catch (error) { toast.error('Erro ao deletar fornecedor.'); } 
    finally { setDialogOpen(false); setFornecedorParaDeletar(null); }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gestão de Fornecedores</Typography>
      <FornecedorForm onSucesso={handleSucesso} fornecedorParaEditar={fornecedorParaEditar} limparEdicao={() => setFornecedorParaEditar(null)} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Nome Fantasia</TableCell><TableCell>CNPJ</TableCell><TableCell>Telefone</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
          <TableBody>
            {fornecedores.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.nome_fantasia}</TableCell><TableCell>{f.cnpj}</TableCell><TableCell>{f.telefone}</TableCell>
                <TableCell><IconButton onClick={() => handleEditar(f)}><EditIcon /></IconButton><IconButton onClick={() => handleDeleteClick(f)}><DeleteIcon color="error" /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" description={`Deseja excluir o fornecedor "${fornecedorParaDeletar?.nome_fantasia}"?`}/>
    </Box>
  );
};
export default Fornecedores;