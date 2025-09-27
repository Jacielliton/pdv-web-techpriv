// backend/src/templates/relatorioLucratividadeTemplate.js

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

function gerarRelatorioLucratividadeHTML(data) {
  const linhasMaisLucrativos = data.top5MaisLucrativos.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td class="right">${formatCurrency(p.lucroTotal)}</td>
    </tr>
  `).join('');

  const linhasMenosLucrativos = data.top5MenosLucrativos.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td class="right">${formatCurrency(p.lucroTotal)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Lucratividade</title>
      <style>
        :root {
          --primary-color: #1976d2;
          --success-color: #2e7d32;
          --error-color: #d32f2f;
          --text-color: #333;
          --border-color: #e0e0e0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10px;
          color: var(--text-color);
          margin: 0;
        }
        .report-container { padding: 20px; }
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
        .summary-item strong { color: #000; }
        .lucro { color: var(--success-color); }
        .custo { color: var(--error-color); }
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
        th { background-color: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        .right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="report-container">
        <h1>Relatório Gerencial de Lucratividade</h1>
        <p style="text-align: center; margin-top: -10px; margin-bottom: 25px;">
          Período de ${new Date(data.periodo.inicio).toLocaleDateString('pt-BR')} a ${new Date(data.periodo.fim).toLocaleDateString('pt-BR')}
        </p>

        <h2>Resumo Financeiro</h2>
        <div class="summary-section">
          <div class="summary-item"><span>Faturamento Bruto:</span> <strong>${formatCurrency(data.resumo.faturamentoBruto)}</strong></div>
          <div class="summary-item"><span>Custo da Mercadoria:</span> <strong class="custo">-${formatCurrency(data.resumo.custoTotal)}</strong></div>
          <div class="summary-item"><span>Lucro Bruto:</span> <strong class="lucro">${formatCurrency(data.resumo.lucroBruto)}</strong></div>
          <div class="summary-item"><span>Margem de Lucro:</span> <strong>${formatPercent(data.resumo.margemLucro)}</strong></div>
        </div>

        <h2>Análise de Produtos</h2>
        
        <h3>Top 5 Produtos Mais Lucrativos</h3>
        <table>
          <thead><tr><th>Produto</th><th class="right">Lucro Total</th></tr></thead>
          <tbody>${linhasMaisLucrativos}</tbody>
        </table>

        <h3>Top 5 Produtos Menos Lucrativos</h3>
        <table>
          <thead><tr><th>Produto</th><th class="right">Lucro Total</th></tr></thead>
          <tbody>${linhasMenosLucrativos}</tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}

module.exports = gerarRelatorioLucratividadeHTML;