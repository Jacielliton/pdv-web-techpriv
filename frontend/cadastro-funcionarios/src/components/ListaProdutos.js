// src/components/ListaProdutos.js (VERSÃO COM BOTÃO DE ENTRADA DE ESTOQUE)
import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// 1. IMPORTE O NOVO ÍCONE
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const customLocaleText = {
  noRowsLabel: 'Nenhum resultado encontrado',
  footerRowSelected: (count) => `${count.toLocaleString()} linha(s) selecionada(s)`,
};

// 2. ADICIONE 'onRegistrarEntrada' ÀS PROPRIEDADES DO COMPONENTE
const ListaProdutos = ({ onEdit, onDeleteRequest, onRegistrarEntrada, produtos, loading }) => {
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
      width: 150, // Aumentei a largura para caber o novo botão
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box>
          {/* 3. ADICIONE O NOVO BOTÃO E TOOLTIP AQUI */}
          <Tooltip title="Registrar Entrada">
            <IconButton onClick={() => onRegistrarEntrada(params.row)} color="primary">
              <AddShoppingCartIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar"><IconButton onClick={() => onEdit(params.row)}><EditIcon /></IconButton></Tooltip>
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
        pageSize={10}
        rowsPerPageOptions={[10]}
        loading={loading}
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