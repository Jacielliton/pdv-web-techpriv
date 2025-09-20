import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Recibo from '../components/Recibo';
import { Box, CircularProgress, Typography } from '@mui/material';

// Estilos que serão aplicados APENAS na hora da impressão
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #recibo-para-imprimir, #recibo-para-imprimir * {
      visibility: visible;
    }
    #recibo-para-imprimir {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
`;

function PaginaRecibo() {
  const { vendaId } = useParams();
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendaId) return;

    const fetchVenda = async () => {
      try {
        const response = await api.get(`/vendas/${vendaId}`);
        setVenda(response.data);
      } catch (err) {
        setError('Não foi possível carregar os dados da venda.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenda();
  }, [vendaId]);

  useEffect(() => {
    // Quando os dados da venda chegarem, aciona a impressão
    if (venda) {
      window.print();
    }
  }, [venda]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 4 }}>{error}</Typography>;
  }

  return (
    <>
      <style>{printStyles}</style>
      <Box id="recibo-para-imprimir">
        <Recibo venda={venda} />
      </Box>
    </>
  );
}

export default PaginaRecibo;