// pdv-web-techpriv\frontend\cadastro-funcionarios\src\routes\index.js (VERSÃO COM HASHROUTER)
import React from 'react';
// ---> CORREÇÃO APLICADA AQUI <---
import { HashRouter, Routes as Switch, Route, Navigate } from 'react-router-dom';
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
import Clientes from '../pages/Clientes';
import HistoricoMovimentacoes from '../pages/HistoricoMovimentacoes';
import Fornecedores from '../pages/Fornecedores';


const Routes = () => {
  const { signed, loading, isManager } = useAuth();

  if (loading) {
    return <div><h1>Carregando...</h1></div>;
  }

  if (!signed) {
    return (
      // ---> CORREÇÃO APLICADA AQUI <---
      <HashRouter>
        <Switch>
          <Route path="*" element={<Login />} />
        </Switch>
      </HashRouter>
    );
  }

  return (
    // ---> CORREÇÃO APLICADA AQUI <---
    <HashRouter>
      <Switch>
        <Route element={<Layout />}>
          {isManager && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/historico-caixas" element={<HistoricoCaixas />} />
              <Route path="/historico-movimentacoes" element={<HistoricoMovimentacoes />} />
              <Route path="/relatorios" element={<Relatorios />} />              
              <Route path="/fornecedores" element={<Fornecedores />} />
            </>
          )}

          <Route path="/venda" element={<FrenteDeCaixa />} />
          <Route path="/fechamento-caixa" element={<FechamentoCaixa />} />
          <Route path="/historico" element={<HistoricoVendas />} />
          <Route path="/clientes" element={<Clientes />} />
          
          <Route path="*" element={<Navigate to={isManager ? "/" : "/venda"} replace />} />
        </Route>
      </Switch>
    </HashRouter>
  );
};

export default Routes;