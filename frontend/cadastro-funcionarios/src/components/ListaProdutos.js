// src/components/ListaProdutos.js (VERSÃO FINAL CORRIGIDA)
import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
// CORREÇÃO: Removemos a importação de ptBR
import { DataGrid } from '@mui/x-data-grid'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// NOVO: Objeto de tradução customizado
const customLocaleText = {
  noRowsLabel: 'Nenhum resultado encontrado',
  footerRowSelected: (count) => `${count.toLocaleString()} linha(s) selecionada(s)`,
  // Adicione outras traduções aqui se necessário
};

const ListaProdutos = ({ onEdit, onDeleteRequest, produtos, loading }) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 200 },
    { 
      field: 'preco', 
      headerName: 'Preço', 
      width: 130,
      renderCell: (params) => `R$ ${Number(params.value).toFixed(2)}`
    },
    { field: 'quantidade_estoque', headerName: 'Estoque', width: 130 },
    { field: 'codigo_barras', headerName: 'Cód. Barras', flex: 1, minWidth: 150,
      renderCell: (params) => params.value || 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar"><IconButton onClick={() => onEdit(params.row)} color="primary"><EditIcon /></IconButton></Tooltip>
          <Tooltip title="Excluir"><IconButton onClick={() => onDeleteRequest(params.row.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={produtos}
        columns={columns}
        pageSize={10} // Aumentado para 10 para melhor visualização
        rowsPerPageOptions={[10]}
        loading={loading}
        // CORREÇÃO: Usamos nosso objeto de tradução customizado
        localeText={customLocaleText} 
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
};

export default ListaProdutos;