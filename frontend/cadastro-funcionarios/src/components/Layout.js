// frontend/cadastro-funcionarios/src/components/Layout.js (VERSÃO FINAL E CORRIGIDA)
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../contexts/theme'; 
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, Divider, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Layout = () => {
  // 1. Pegamos o 'caixaStatus' do nosso hook
  const { signOut, user, isManager, caixaStatus } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const navStyle = { 
    width: '240px', 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    // Usa a cor de fundo padrão do tema (claro ou escuro)
    backgroundColor: (theme) => theme.palette.background.paper, 
  };
  const contentStyle = { 
    flex: 1, 
    padding: '20px', 
    overflowY: 'auto',
    // Usa a cor de fundo secundária do tema
    backgroundColor: (theme) => theme.palette.background.default,
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={navStyle}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">PDV</Typography>
          {/* 3. ADICIONE O BOTÃO DE TROCA DE TEMA */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/venda">
              <ListItemText primary="Frente de Caixa" />
            </ListItemButton>
          </ListItem>

          {/* 2. LÓGICA CORRIGIDA: O link 'Fechar Caixa' aparece para TODOS se o caixa estiver ABERTO */}
          {caixaStatus === 'ABERTO' && (
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/fechamento-caixa" sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                <ListItemText primary="Fechar Caixa" sx={{ color: 'primary.main', fontWeight: 'bold' }} />
              </ListItemButton>
            </ListItem>
          )}
          
          {isManager && (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/historico">
                  <ListItemText primary="Histórico de Vendas" />
                </ListItemButton>
              </ListItem>
              
               <ListItem disablePadding>
                <ListItemButton component={Link} to="/historico-caixas">
                  <ListItemText primary="Histórico de Caixas" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="/relatorios">
                  <ListItemText primary="Relatórios" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="/">
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/funcionarios">
                  <ListItemText primary="Funcionários" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/produtos">
                  <ListItemText primary="Produtos" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
        
        <Box sx={{ marginTop: 'auto', p: 2 }}>
          <Divider />
          <Typography sx={{ mt: 2 }}>Olá, {user?.nome}</Typography>
          <Typography variant="caption">{user?.cargo}</Typography>
          <Button variant="contained" onClick={signOut} fullWidth sx={{ mt: 1 }}>Sair</Button>
        </Box>
      </Box>

      <Box component="main" sx={contentStyle}>
        <Outlet />
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </Box>
  );
};

export default Layout;