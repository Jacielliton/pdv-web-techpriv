// src/pages/Produtos.js

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ALTERADO: Importa a instância 'api'
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography } from '@mui/material';


function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      // ALTERADO: Usa 'api' e a URL relativa
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (err) {
      console.error("Falha ao carregar produtos", err);
      toast.error('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleSuccess = () => {
    fetchProdutos();
    setProdutoParaEditar(null);
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