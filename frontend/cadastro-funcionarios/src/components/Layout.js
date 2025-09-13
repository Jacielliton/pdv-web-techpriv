//pdv-web-techpriv\frontend\cadastro-funcionarios\src\components\Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Outlet renderiza o conteúdo da rota filha
import { useAuth } from '../contexts/auth';

// 1. Importe o Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const { signOut, user } = useAuth();

  const layoutStyle = { display: 'flex', height: '100vh' };
  const navStyle = { width: '200px', background: '#f4f4f4', padding: '20px' };
  const contentStyle = { flex: 1, padding: '20px', overflowY: 'auto' };
  const linkStyle = { display: 'block', margin: '10px 0', textDecoration: 'none' };

  return (
    <div style={layoutStyle}>
      <nav style={navStyle}>
        <h2>PDV</h2>
        <Link to="/venda" style={linkStyle}>Frente de Caixa</Link>
        <Link to="/historico" style={linkStyle}>Histórico de Vendas</Link>
        <Link to="/funcionarios" style={linkStyle}>Funcionários</Link>
        <Link to="/produtos" style={linkStyle}>Produtos</Link>
        <div style={{ position: 'absolute', bottom: '20px' }}>
            <span>Olá, {user?.nome}</span>
            <button onClick={signOut} style={{ marginTop: '10px', display: 'block' }}>Sair</button>
        </div>
      </nav>
      <main style={contentStyle}>
        <Outlet /> 
      </main>
      {/* 2. Adicione o ToastContainer aqui */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Layout;