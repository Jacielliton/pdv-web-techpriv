import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Importando componentes do MUI que usaremos
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';
// Adicionei o Button do MUI que estava faltando
import { Button } from '@mui/material';

const Layout = () => {
  // 1. Puxe o 'isManager' do nosso hook
  const { signOut, user, isManager } = useAuth();

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
          {/* O link de Frente de Caixa aparece para todos */}
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/venda">
              <ListItemText primary="Frente de Caixa" />
            </ListItemButton>
          </ListItem>
          
          {/* 2. Envolva os links de gerente em uma condição */}
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
        autoClose={5000}
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