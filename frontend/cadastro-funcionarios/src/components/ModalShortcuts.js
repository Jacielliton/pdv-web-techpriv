// src/components/ModalShortcuts.js
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText,
  ListItemIcon, Divider, IconButton, Box
} from '@mui/material';
import {
  KeyboardCommandKey, Search, PointOfSale, Payment, CleaningServices, Close
} from '@mui/icons-material';

const shortcuts = [
  { key: 'F4', description: 'Focar na busca de produtos' },
  { key: 'F8', description: 'Focar no campo "Valor Pago"' },
  { key: 'F10', description: 'Finalizar a Venda' },
  { key: 'ESC', description: 'Limpar o carrinho de compras' },
];

const ModalShortcuts = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardCommandKey />
          <Typography variant="h6" component="span">Atalhos do Teclado</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <List>
          {shortcuts.map((shortcut) => (
            <ListItem key={shortcut.key}>
              <ListItemIcon>
                <Typography variant="body1" component="span" sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  fontWeight: 'bold'
                }}>
                  {shortcut.key}
                </Typography>
              </ListItemIcon>
              <ListItemText primary={shortcut.description} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ModalShortcuts;