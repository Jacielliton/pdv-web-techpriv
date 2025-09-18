// frontend/src/components/GraficoVendas.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoVendas = ({ data }) => {
  return (
    // ResponsiveContainer faz o gráfico se adaptar ao tamanho do container pai
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="data" />
        <YAxis tickFormatter={(value) => `R$${value}`} />
        <Tooltip formatter={(value) => [`R$${Number(value).toFixed(2)}`, 'Total']} />
        <Legend />
        <Bar dataKey="total" fill="#8884d8" name="Total de Vendas (R$)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficoVendas;