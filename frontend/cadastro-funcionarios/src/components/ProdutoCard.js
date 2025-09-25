// frontend/src/components/ProdutoCard.js (VERSÃO FINAL ALINHADA)
import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

const ProdutoCard = ({ produto, onProdutoClick }) => {
  const semEstoque = produto.quantidade_estoque <= 0;

  return (
    <Card 
      sx={{ 
        width: '100%', // Ocupa toda a largura da célula do grid
        height: '100%', // Ocupa toda a altura (forçado pelo GridProdutosVenda)
        display: 'flex', // Habilita o flexbox para o conteúdo interno
        flexDirection: 'column',
        opacity: semEstoque ? 0.5 : 1,
      }}
      elevation={2}
    >
      <CardActionArea 
        onClick={() => !semEstoque && onProdutoClick(produto)} 
        disabled={semEstoque}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} // Faz a área clicável crescer
      >
        <CardContent sx={{ flexGrow: 1, p: 1.5 }}> {/* Faz o conteúdo principal crescer, empurrando o preço para baixo */}
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              lineHeight: 1.25, 
              // Garante espaço para até 2 linhas, evitando que o card mude de altura
              height: '2.5em', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
            }}
          >
            {produto.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {semEstoque ? 'Sem Estoque' : `Estoque: ${produto.quantidade_estoque}`}
          </Typography>
        </CardContent>

        <Box sx={{ p: 1, width: '100%' }}>
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

export default React.memo(ProdutoCard); // Usamos React.memo para otimização