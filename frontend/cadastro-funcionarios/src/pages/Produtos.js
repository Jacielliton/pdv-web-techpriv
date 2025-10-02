// src/pages/Produtos.js (VERSÃO CORRIGIDA)
import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import api from '../services/api';
import ProdutoForm from '../components/ProdutoForm';
import ListaProdutos from '../components/ListaProdutos';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';
// ADIÇÃO: InputAdornment para o ícone no campo de texto
import { Container, Typography, Box, Pagination, Paper, Grid, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Ícone para os novos campos
import ModalEntradaEstoque from '../components/ModalEntradaEstoque';
import ModalDetalhesProduto from '../components/ModalDetalhesProduto';
import GerenciadorEntidadeModal from '../components/GerenciadorEntidadeModal';
// ADIÇÃO: Importa o modal de seleção que você enviou
import SelecaoEntidadeModal from '../components/SelecaoEntidadeModal';

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
  const [filtros, setFiltros] = useState({ nome: '', grupoId: '', categoriaId: '' });
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [gerenciadorModal, setGerenciadorModal] = useState({ open: false, tipo: '' });
  const [formKey, setFormKey] = useState(0);
  const [grupos, setGrupos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  // ADIÇÃO: Estado para controlar o novo modal de seleção de filtros
  const [selecaoModal, setSelecaoModal] = useState({ open: false, tipo: '' });


  useEffect(() => {
    const fetchFiltroData = async () => {
      try {
        const [gruposRes, categoriasRes] = await Promise.all([
          api.get('/grupos'),
          api.get('/categorias')
        ]);
        setGrupos(gruposRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        toast.error("Erro ao carregar dados para os filtros.");
      }
    };
    fetchFiltroData();
  }, []);

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

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

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

  const handleModalSuccess = () => { setFormKey(prevKey => prevKey + 1); };
  const handleAbrirGerenciador = (tipo) => { setGerenciadorModal({ open: true, tipo }); };
  const handlePageChange = (event, value) => { setPage(value); };

  const handleEdit = (produto) => {
    setProdutoParaEditar(produto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

   const handleCancelEdit = () => { setProdutoParaEditar(null); };

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

  // ADIÇÃO: Handler para quando um item é selecionado no modal de filtro
  const handleFiltroSelecionado = (item) => {
    const { tipo } = selecaoModal;
    if (tipo === 'Grupo') {
      setFiltros(f => ({ ...f, grupoId: item.id }));
    } else if (tipo === 'Categoria') {
      setFiltros(f => ({ ...f, categoriaId: item.id }));
    }
  };

  // ADIÇÃO: Funções para pegar o nome do item selecionado para exibir no campo
  const nomeGrupoFiltro = useMemo(() => grupos.find(g => g.id === filtros.grupoId)?.nome || '', [grupos, filtros.grupoId]);
  const nomeCategoriaFiltro = useMemo(() => categorias.find(c => c.id === filtros.categoriaId)?.nome || '', [categorias, filtros.categoriaId]);

  
  const handleAplicarFiltros = () => {
    setPage(1);
    setFiltrosAtivos({
      nome: filtros.nome,
      grupo_id: filtros.grupoId,
      categoria_id: filtros.categoriaId,
    });
  };

  const handleLimparFiltros = () => {
    setPage(1);
    setFiltros({ nome: '', grupoId: '', categoriaId: '' });
    setFiltrosAtivos({});
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
        onAbrirGerenciador={handleAbrirGerenciador} // << GARANTA QUE ESTA LINHA EXISTA
      />

      {/* =================================================================== */}
      {/* ALTERAÇÃO: Barra de filtros agora usa o modelo de modal de seleção  */}
      {/* =================================================================== */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm>
            <TextField 
              name="nome" 
              label="Buscar por nome..." 
              value={filtros.nome}
              onChange={handleFiltroChange}
              fullWidth 
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Grupo"
              value={nomeGrupoFiltro}
              onClick={() => setSelecaoModal({ open: true, tipo: 'Grupo' })}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Categoria"
              value={nomeCategoriaFiltro}
              onClick={() => setSelecaoModal({ open: true, tipo: 'Categoria' })}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button variant="contained" onClick={handleAplicarFiltros}>Buscar</Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button variant="outlined" onClick={handleLimparFiltros}>Limpar</Button>
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

      <SelecaoEntidadeModal
        open={selecaoModal.open}
        onClose={() => setSelecaoModal({ open: false, tipo: '' })}
        tipo={selecaoModal.tipo}
        itens={selecaoModal.tipo === 'Grupo' ? grupos : categorias}
        onSelecionar={handleFiltroSelecionado}
      />
      
    </Container>
  );
}

export default Produtos;