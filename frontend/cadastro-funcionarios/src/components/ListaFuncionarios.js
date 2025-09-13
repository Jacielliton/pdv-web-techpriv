// src/components/ListaFuncionarios.js (VERSÃO COM MUI)
import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Typography 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ListaFuncionarios = ({ onEdit, onDeleteRequest, funcionarios, loading, error }) => {
  // A função handleDelete antiga foi removida daqui

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <TableContainer component={Paper} sx={{ marginTop: 4 }}>
      <Typography variant="h6" component="div" sx={{ padding: '16px' }}>
        Funcionários Cadastrados
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="tabela de funcionários">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {funcionarios.map((func) => (
            <TableRow key={func.id}>
              <TableCell>{func.id}</TableCell>
              <TableCell>{func.nome}</TableCell>
              <TableCell>{func.cargo}</TableCell>
              <TableCell>{func.email}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(func)} color="primary">
                  <EditIcon />
                </IconButton>
                {/* Chama a prop onDeleteRequest, que vem da página pai */}
                <IconButton onClick={() => onDeleteRequest(func.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListaFuncionarios;