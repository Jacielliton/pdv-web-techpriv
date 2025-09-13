import React from 'react';
import { BrowserRouter, Routes as Switch, Route } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';       // <-- Nova página principal
import Funcionarios from '../pages/Funcionarios'; // <-- Página renomeada
import Produtos from '../pages/Produtos';
import FrenteDeCaixa from '../pages/FrenteDeCaixa';
import HistoricoVendas from '../pages/HistoricoVendas';
import Layout from '../components/Layout';

const Routes = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div><h1>Carregando...</h1></div>;
  }

  if (!signed) {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="*" element={<Login />} />
        </Switch>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Switch>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} /> {/* Rota principal agora é o Dashboard */}
          <Route path="/funcionarios" element={<Funcionarios />} /> {/* Funcionários em sua própria rota */}
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/venda" element={<FrenteDeCaixa />} />
          <Route path="/historico" element={<HistoricoVendas />} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;