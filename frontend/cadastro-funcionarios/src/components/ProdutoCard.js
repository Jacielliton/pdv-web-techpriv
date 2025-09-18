// frontend/cadastro-funcionarios/src/components/ProdutoCard.js
import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

const ProdutoCard = ({ produto, onProdutoClick }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea 
        onClick={() => onProdutoClick(produto)} 
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <CardContent>
          <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
            {produto.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estoque: {produto.quantidade_estoque}
          </Typography>
        </CardContent>
        <Box sx={{ width: '100%', p: 2, pt: 0 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
            R$ {Number(produto.preco).toFixed(2)}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default ProdutoCard;