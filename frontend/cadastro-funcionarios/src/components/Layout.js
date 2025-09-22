// frontend/cadastro-funcionarios/src/components/Layout.js (VERSÃO COM CABEÇALHO CORRIGIDO)

import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../contexts/theme'; 
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, Divider, Button, Drawer, ListItemIcon } from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; 

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';

import ModalShortcuts from './ModalShortcuts'; 
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const drawerWidth = 240;

const Layout = () => {
  const { signOut, user, isManager, caixaStatus } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(true);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const navItems = [
    { text: 'Frente de Caixa', icon: <PointOfSaleIcon />, path: '/venda', managerOnly: false },
    { text: 'Fechar Caixa', icon: <CloseIcon />, path: '/fechamento-caixa', managerOnly: false, condition: caixaStatus === 'ABERTO', specialStyle: true },
    { text: 'Histórico de Vendas', icon: <HistoryIcon />, path: '/historico', managerOnly: true },
    { text: 'Histórico de Caixas', icon: <HistoryIcon />, path: '/historico-caixas', managerOnly: true },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios', managerOnly: true },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', managerOnly: true },
    { text: 'Funcionários', icon: <PeopleIcon />, path: '/funcionarios', managerOnly: true },
    { text: 'Clientes', icon: <SupervisorAccountIcon />, path: '/clientes', managerOnly: true }, // NOVO ITEM
    { text: 'Produtos', icon: <InventoryIcon />, path: '/produtos', managerOnly: true },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : (theme) => theme.spacing(7),
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : (theme) => theme.spacing(7),
            boxSizing: 'border-box',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {/* ALTERADO: Lógica de alinhamento e visibilidade do cabeçalho */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'space-between' : 'center', // Altera o alinhamento
          p: 1 
        }}>
            {/* O logo só aparece se o menu estiver aberto */}
            {open && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <StorefrontIcon color="primary" />
                  <Typography variant="h5" component="h1" sx={{ pl: 1 }}>PDV</Typography>
              </Box>
            )}
            
            <IconButton onClick={handleDrawerToggle}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
        </Box>
        <Divider />
        <List sx={{ overflowY: 'auto' }}>
          {navItems.map((item) => {
            if (item.managerOnly && !isManager) return null;
            if (item.hasOwnProperty('condition') && !item.condition) return null;
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path} sx={item.specialStyle ? { backgroundColor: 'rgba(25, 118, 210, 0.1)' } : {}}>
                  <ListItemIcon sx={item.specialStyle ? { color: 'primary.main' } : {}}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} sx={item.specialStyle ? { color: 'primary.main', fontWeight: 'bold' } : {}} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ marginTop: 'auto', p: 2, whiteSpace: 'nowrap' }}>

          <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => setShortcutsModalOpen(true)}
                  sx={{ justifyContent: open ? 'initial' : 'center', px: 2.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                    <HelpOutlineIcon />
                  </ListItemIcon>
                  {open && <ListItemText primary="Atalhos" sx={{ opacity: open ? 1 : 0 }} />}
                </ListItemButton>
            </ListItem>

            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', mt: 2 }}>
                {open && (
                    <Box>
                        <Typography>Olá, {user?.nome}</Typography>
                        <Typography variant="caption">{user?.cargo}</Typography>
                    </Box>
                )}
                <IconButton onClick={toggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>
            <Button 
              variant="contained" 
              onClick={signOut} 
              fullWidth 
              sx={{ mt: 1, justifyContent: open ? 'flex-start' : 'center', px: open ? 2 : 0 }}
              startIcon={<LogoutIcon />}
            >
              {open && 'Sair'}
            </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto', backgroundColor: (theme) => theme.palette.background.default }}>
        <Outlet />
      </Box>

      <ModalShortcuts open={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default Layout;