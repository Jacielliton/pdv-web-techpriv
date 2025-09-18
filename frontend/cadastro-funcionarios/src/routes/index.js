// pdv-web-techpriv\frontend\cadastro-funcionarios\src\routes\index.js (VERSÃO CORRIGIDA)
import React from 'react';
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
import Relatorios from '../pages/Relatorios';
import FechamentoCaixa from '../pages/FechamentoCaixa'; 

const Routes = () => {
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

  return (
    <BrowserRouter>
      <Switch>
        <Route element={<Layout />}>
          {/* --- Rotas Exclusivas para Gerente --- */}
          {isManager && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/historico" element={<HistoricoVendas />} />
              <Route path="/historico-caixas" element={<HistoricoCaixas />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </>
          )}

          {/* --- Rotas Comuns para TODOS os funcionários logados --- */}
          <Route path="/venda" element={<FrenteDeCaixa />} />
          
          {/* --- ROTA CORRIGIDA --- */}
          {/* Fechamento de Caixa agora é acessível a todos os usuários logados */}
          <Route path="/fechamento-caixa" element={<FechamentoCaixa />} />
          
          {/* Rota "catch-all" para redirecionar qualquer outra URL inválida */}
          <Route path="*" element={<Navigate to={isManager ? "/" : "/venda"} replace />} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;