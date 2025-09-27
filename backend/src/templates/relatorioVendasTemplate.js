// backend/src/templates/relatorioVendasTemplate.js

// Função para formatar valores como moeda BRL
const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Função principal que gera o HTML do relatório
function gerarRelatorioHTML(data) {
  // Gera as linhas da tabela de produtos
  const linhasProdutos = data.produtosVendidos.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td class="center">${p.quantidade}</td>
      <td class="right">${formatCurrency(p.precoMedio)}</td>
      <td class="right">${formatCurrency(p.receitaTotal)}</td>
    </tr>
  `).join('');

  // Gera as linhas da tabela de métodos de pagamento
  const linhasMetodos = data.vendasPorMetodo.map(m => `
    <tr>
      <td>${m.metodo_pagamento}</td>
      <td class="right">${formatCurrency(m.total)}</td>
    </tr>
  `).join('');

  // Gera as linhas da tabela de vendedores
  const linhasVendedores = data.topVendedores.map(v => `
    <tr>
      <td>${v.nome}</td>
      <td class="right">${formatCurrency(v.totalVendido)}</td>
    </tr>
  `).join('');

  // Retorna o HTML completo como uma string
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Vendas</title>
      <style>
        :root {
          --primary-color: #1976d2;
          --text-color: #333;
          --border-color: #e0e0e0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10px;
          color: var(--text-color);
          margin: 0;
        }
        .report-container {
          padding: 20px;
        }
        .header, .footer {
          width: 100%;
          text-align: center;
          position: fixed;
          font-size: 8px;
          color: #777;
        }
        .header {
          top: 0px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 5px;
        }
        .footer {
          bottom: 0px;
          border-top: 1px solid var(--border-color);
          padding-top: 5px;
        }
        .page-number::after {
          content: counter(page);
        }
        h1, h2 {
          color: var(--primary-color);
          border-bottom: 2px solid var(--primary-color);
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        h1 { font-size: 20px; text-align: center; }
        h2 { font-size: 14px; }
        .summary-section {
          background-color: #f5f5f5;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 25px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 5px;
          border-bottom: 1px dotted #ccc;
        }
        .summary-item strong {
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        th, td {
          border: 1px solid var(--border-color);
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .right { text-align: right; }
        .center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="report-container">
        <h1>Relatório Gerencial de Vendas</h1>
        <p style="text-align: center; margin-top: -10px; margin-bottom: 25px;">
          Período de ${new Date(data.periodo.inicio).toLocaleDateString('pt-BR')} a ${new Date(data.periodo.fim).toLocaleDateString('pt-BR')}
        </p>

        <h2>Resumo Financeiro</h2>
        <div class="summary-section">
          <div class="summary-item"><span>Faturamento Bruto (Subtotal):</span> <strong>${formatCurrency(data.resumo.faturamentoBruto)}</strong></div>
          <div class="summary-item"><span>Total de Descontos Concedidos:</span> <strong>-${formatCurrency(data.resumo.totalDescontos)}</strong></div>
          <div class="summary-item"><span>Faturamento Líquido (Total):</span> <strong>${formatCurrency(data.resumo.totalVendido)}</strong></div>
          <div class="summary-item"><span>Número de Vendas:</span> <strong>${data.resumo.numeroDeVendas}</strong></div>
          <div class="summary-item"><span>Ticket Médio:</span> <strong>${formatCurrency(data.resumo.ticketMedio)}</strong></div>
        </div>

        <h2>Análise Detalhada</h2>
        
        <h3>Vendas por Método de Pagamento</h3>
        <table>
          <thead><tr><th>Método</th><th class="right">Total Arrecadado</th></tr></thead>
          <tbody>${linhasMetodos}</tbody>
        </table>

        <h3>Desempenho dos Vendedores</h3>
        <table>
          <thead><tr><th>Vendedor</th><th class="right">Total Vendido</th></tr></thead>
          <tbody>${linhasVendedores}</tbody>
        </table>

        <h3>Análise de Produtos Vendidos</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th class="center">Qtd. Vendida</th>
              <th class="right">Preço Médio</th>
              <th class="right">Receita Total</th>
            </tr>
          </thead>
          <tbody>${linhasProdutos}</tbody>
        </table>

      </div>
    </body>
    </html>
  `;
}

module.exports = gerarRelatorioHTML;