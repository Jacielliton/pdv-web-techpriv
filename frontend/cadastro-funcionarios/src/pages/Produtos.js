// src/pages/Produtos.js (VERSÃO CORRIGIDA)
import React, { useState, useEffect, useCallback } from 'react'; 
import api from '../services/api';
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
import { Container, Typography, Box, Pagination, Paper, Grid, TextField, Button } from '@mui/material';
import ModalEntradaEstoque from '../components/ModalEntradaEstoque';
import ModalDetalhesProduto from '../components/ModalDetalhesProduto';
import GerenciadorEntidadeModal from '../components/GerenciadorEntidadeModal';


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
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [produtoDetalhes, setProdutoDetalhes] = useState(null);
  const [filtros, setFiltros] = useState({ nome: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [gerenciadorModal, setGerenciadorModal] = useState({ open: false, tipo: '' });
  const [formKey, setFormKey] = useState(0); // Chave para forçar o refresh do ProdutoForm


  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/produtos', { params: { page, ...filtrosAtivos } });
      setProdutos(response.data.produtos);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, [page, filtrosAtivos]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const handleSuccess = () => {
    // Se estiver editando, permanece na mesma página. Se estiver cadastrando, vai para a primeira.
    const pageToFetch = produtoParaEditar ? page : 1;
    if (pageToFetch !== page) { 
      setPage(pageToFetch); 
    } else { 
      fetchProdutos(); 
    }
    setProdutoParaEditar(null);
  };

  const handleModalSuccess = () => {
    setFormKey(prevKey => prevKey + 1);
  };

  const handleAbrirGerenciador = (tipo) => {
    setGerenciadorModal({ open: true, tipo });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleEdit = (produto) => {
    setProdutoParaEditar(produto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      // 2. PEQUENA OTIMIZAÇÃO: Apenas chamamos fetchProdutos, sem passar a página.
      // A função já usa o 'page' do estado atual.
      fetchProdutos(); 
    } catch (err) {
      toast.error('Erro ao excluir produto.');
    } finally {
      setDialogOpen(false);
      setProdutoParaDeletar(null);
    }
  };
  
  const handleOpenModalEntrada = (produto) => {
    setProdutoSelecionado(produto);
    setModalEntradaOpen(true);
  };

  const handleOpenDetalhes = async (produto) => {
    try {
      setLoading(true);
      const response = await api.get(`/produtos/${produto.id}/detalhes`);
      setProdutoDetalhes(response.data);
      setModalDetalhesOpen(true);
    } catch (error) {
      toast.error('Erro ao buscar detalhes do produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };
  
  const handleAplicarFiltros = () => {
    setPage(1);
    setFiltrosAtivos(filtros);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Produtos
      </Typography>

      <ProdutoForm
        key={formKey}
        onSucesso={handleSuccess}
        produtoParaEditar={produtoParaEditar}
        limparEdicao={handleCancelEdit}
        // ADIÇÃO: Passando a nova função como prop
        onAbrirGerenciador={handleAbrirGerenciador}
      />

      {/* =================================================================== */}
      {/* ALTERAÇÃO: Removidos os botões de "Gerenciar" desta seção         */}
      {/* =================================================================== */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField 
                name="nome" 
                label="Buscar produto por nome..." 
                value={filtros.nome}
                onChange={handleFiltroChange}
                onKeyPress={(e) => e.key === 'Enter' && handleAplicarFiltros()}
                fullWidth 
                size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={handleAplicarFiltros} fullWidth>Buscar</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <ListaProdutos
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          produtos={produtos}
          loading={loading}
          onRegistrarEntrada={handleOpenModalEntrada}
          onVerDetalhes={handleOpenDetalhes}
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
        // Corrigi a prop de 'message' para 'description' para ser consistente com seus outros usos
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />

      <ModalEntradaEstoque 
        open={modalEntradaOpen}
        onClose={() => setModalEntradaOpen(false)}
        produto={produtoSelecionado}
        onSucesso={handleSuccess}
      />
      
      <ModalDetalhesProduto
        open={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        produto={produtoDetalhes}
      />

      <GerenciadorEntidadeModal
        open={gerenciadorModal.open}
        onClose={() => setGerenciadorModal({ open: false, tipo: '' })}
        tipo={gerenciadorModal.tipo}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
}

export default Produtos;