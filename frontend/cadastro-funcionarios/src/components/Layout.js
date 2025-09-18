import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider, Button } from '@mui/material';

const Layout = () => {
  // 1. ALTERAÇÃO: Pegamos o 'caixaStatus' do nosso hook de autenticação
  const { signOut, user, isManager, caixaStatus } = useAuth();

  const navStyle = { width: '240px', background: '#f4f4f4', height: '100vh', display: 'flex', flexDirection: 'column' };
  const contentStyle = { flex: 1, padding: '20px', overflowY: 'auto', background: '#fff' };

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="nav" sx={navStyle}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" component="h1">PDV</Typography>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/venda">
              <ListItemText primary="Frente de Caixa" />
            </ListItemButton>
          </ListItem>

          {/* 2. ALTERAÇÃO: Adicionamos o link 'Fechar Caixa' que só aparece se o caixa estiver ABERTO */}
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
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default Layout;