import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalVendidoHoje: 0,
    numeroDeVendasHoje: 0,
    topProdutos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/dashboard/summary');
        setSummary(response.data);
      } catch (err) {
        console.error("Erro ao buscar resumo do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);
  
  // Estilos para os cards
  const cardContainerStyle = { display: 'flex', gap: '20px', marginBottom: '20px' };
  const cardStyle = { flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' };
  const cardTitleStyle = { fontSize: '18px', margin: '0 0 10px 0' };
  const cardValueStyle = { fontSize: '32px', fontWeight: 'bold' };

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Dashboard Gerencial</h1>

      <div style={cardContainerStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Total Vendido Hoje</h2>
          <p style={cardValueStyle}>R$ {Number(summary.totalVendidoHoje).toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Número de Vendas Hoje</h2>
          <p style={cardValueStyle}>{summary.numeroDeVendasHoje}</p>
        </div>
      </div>

      <div>
        <h3>Top 5 Produtos Mais Vendidos</h3>
        {summary.topProdutos.length === 0 ? (
          <p>Nenhum produto vendido hoje.</p>
        ) : (
          <ol>
            {summary.topProdutos.map(produto => (
              <li key={produto.nome}>
                {produto.nome} - <strong>{produto.total_vendido}</strong> unidades vendidas
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default Dashboard;