// src/pages/Produtos.js (VERSÃO COM MUI)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog'; // 1. Importe o diálogo
import { toast } from 'react-toastify';
import { Container, Typography } from '@mui/material';


function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);

  // 2. Crie estados para controlar o diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3333/api/produtos');
      setProdutos(response.data);
    } catch (err) {
      console.error("Falha ao carregar produtos", err);
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

  // 3. Crie a função para abrir o diálogo
  const handleDeleteRequest = (id) => {
    setProdutoParaDeletar(id);
    setDialogOpen(true);
  };

  // 4. Crie a função que será chamada ao confirmar a exclusão
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3333/api/produtos/${produtoParaDeletar}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos();
    } catch (err) {
      toast.error('Erro ao excluir produto.');
    } finally {
      setDialogOpen(false); // Fecha o diálogo
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
      {/* 5. Passe a nova função para o componente de lista */}
      <ListaProdutos
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest} // <--- passe a nova função
        produtos={produtos}
        loading={loading}
      />
      {/* 6. Adicione o componente de diálogo à página */}
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