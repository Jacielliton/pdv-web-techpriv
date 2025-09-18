// src/pages/Produtos.js

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ALTERADO: Importa a instância 'api'
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography, Box, Pagination } from '@mui/material';


function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProdutos = async (currentPage) => {
    setLoading(true);
    try {
      // Passa o número da página como parâmetro para a API
      const response = await api.get('/produtos', {
        params: { page: currentPage }
      });
      setProdutos(response.data.produtos);
      setTotalPages(response.data.totalPages); // Armazena o total de páginas
    } catch (err) {
      toast.error('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos(page);
  }, [page]);

  const handleSuccess = () => {
    fetchProdutos(page); // Recarrega a página atual após um sucesso
    setProdutoParaEditar(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleEdit = (produto) => {
    setProdutoParaEditar(produto);
  };

  const handleCancelEdit = () => {
    setProdutoParaEditar(null);
  };

  const handleDeleteRequest = (id) => {
    setProdutoParaDeletar(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // ALTERADO: Usa 'api' e a URL relativa
      await api.delete(`/produtos/${produtoParaDeletar}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos();
    } catch (err) {
      toast.error('Erro ao excluir produto.');
    } finally {
      setDialogOpen(false);
      setProdutoParaDeletar(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Produtos
      </Typography>
      <ProdutoForm
        onSucesso={handleSuccess}
        produtoParaEditar={produtoParaEditar}
        limparEdicao={handleCancelEdit}
      />
      <ListaProdutos
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
        produtos={produtos}
        loading={loading}
      />
      
      {/* 4. ADICIONA O COMPONENTE DE PAGINAÇÃO NO FINAL DA PÁGINA */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange} 
          color="primary" 
          showFirstButton 
          showLastButton 
        />
      </Box>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />
    </Container>
  );
}

export default Produtos;