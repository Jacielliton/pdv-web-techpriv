import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

const ProdutoCard = ({ produto, onProdutoClick }) => {
  const semEstoque = produto.quantidade_estoque <= 0;

  return (
    // Adicionamos um efeito de borda no hover e desabilitamos o card se não houver estoque
    <Card 
      sx={{ 
        height: '100%', 
        border: '1px solid',
        borderColor: 'divider',
        opacity: semEstoque ? 0.5 : 1, // Fica esmaecido se sem estoque
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      elevation={1}
    >
      <CardActionArea 
        onClick={() => !semEstoque && onProdutoClick(produto)} 
        disabled={semEstoque}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}
      >
        {/* Conteúdo do Card com melhor alinhamento */}
        <CardContent sx={{ flex: 1, textAlign: 'center' }}>
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {produto.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {semEstoque ? 'Sem Estoque' : `Estoque: ${produto.quantidade_estoque}`}
          </Typography>
        </CardContent>

        {/* Preço com mais destaque */}
        <Box sx={{ width: '100%', mt: 'auto' }}>
          <Typography 
            variant="h6" 
            color="primary.main" 
            sx={{ fontWeight: 'bold', textAlign: 'center', p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}
          >
            R$ {Number(produto.preco).toFixed(2)}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default ProdutoCard;