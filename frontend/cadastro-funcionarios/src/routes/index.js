// pdv-web-techpriv\frontend\cadastro-funcionarios\src\routes\index.js
import React from 'react';
// Importe também o Navigate para fazer o redirecionamento
import { BrowserRouter, Routes as Switch, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Funcionarios from '../pages/Funcionarios';
import Produtos from '../pages/Produtos';
import FrenteDeCaixa from '../pages/FrenteDeCaixa';
import HistoricoVendas from '../pages/HistoricoVendas';
import Layout from '../components/Layout';
import HistoricoCaixas from '../pages/HistoricoCaixas';
import FechamentoCaixa from '../pages/FechamentoCaixa'; 

const Routes = () => {
  // Puxe também o isManager do hook
  const { signed, loading, isManager } = useAuth();

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

  // Se estiver logado, usa a estrutura de rotas aninhadas com o Layout
  return (
    <BrowserRouter>
      <Switch>
        <Route element={<Layout />}>
          {/* Rotas para Gerente */}
          {isManager ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/historico" element={<HistoricoVendas />} />
              <Route path="/fechamento-caixa" element={<FechamentoCaixa />} />
              <Route path="/historico-caixas" element={<HistoricoCaixas />} />
            </>
          ) : (
            // Se não for gerente, qualquer tentativa de acessar a raiz "/" será redirecionada
            <Route path="/" element={<Navigate to="/venda" replace />} />
          )}

          {/* Rota comum para todos os logados */}
          <Route path="/venda" element={<FrenteDeCaixa />} />
          
          {/* Rota "catch-all" para redirecionar qualquer outra URL inválida */}
          <Route path="*" element={<Navigate to={isManager ? "/" : "/venda"} replace />} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;