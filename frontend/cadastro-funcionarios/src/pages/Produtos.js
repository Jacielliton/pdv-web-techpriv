// src/pages/Produtos.js (VERSÃO COM NOVO DESIGN)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography, Box, Pagination, Paper, Divider } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Novo ícone
import ModalEntradaEstoque from '../components/ModalEntradaEstoque';


function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalEntradaOpen, setModalEntradaOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const handleOpenModalEntrada = (produto) => {
    setProdutoSelecionado(produto);
    setModalEntradaOpen(true);
  };

  const fetchProdutos = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/produtos', {
        params: { page: currentPage }
      });
      setProdutos(response.data.produtos);
      setTotalPages(response.data.totalPages);
      setPage(currentPage);
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
    const pageToFetch = produtoParaEditar ? page : 1;
    fetchProdutos(pageToFetch);
    setProdutoParaEditar(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleEdit = (produto) => {
    setProdutoParaEditar(produto);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para ver o form
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
      await api.delete(`/produtos/${produtoParaDeletar}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos(page);
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

      <Paper elevation={3} sx={{ mb: 4 }}>
        <ProdutoForm
          onSucesso={handleSuccess}
          produtoParaEditar={produtoParaEditar}
          limparEdicao={handleCancelEdit}
        />
        <Divider />
        <ListaProdutos
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          produtos={produtos}
          loading={loading}
          onRegistrarEntrada={handleOpenModalEntrada}
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange} 
          color="primary" 
        />
      </Box>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />

      <ModalEntradaEstoque 
        open={modalEntradaOpen}
        onClose={() => setModalEntradaOpen(false)}
        produto={produtoSelecionado}
        onSucesso={handleSuccess} // Reutiliza sua função de sucesso para recarregar a lista
      />
    </Container>
  );
}

export default Produtos;