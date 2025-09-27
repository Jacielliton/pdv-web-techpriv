// src/App.js (VERSÃO CORRIGIDA E FINAL)
import React, { useEffect } from 'react';
import Routes from './routes';
import axios from 'axios';
import { AuthProvider } from './contexts/auth';
import { ThemeProvider } from './contexts/theme'; 

// --- PASSO 1: Importar os componentes e o CSS da biblioteca de notificações ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // useEffect para verificar a saúde do backend
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3333/api/status');
        console.log('✅ STATUS DO BACKEND:', response.data);
      } catch (error) {
        console.error('❌ ERRO: Não foi possível conectar ao Backend.', error.response?.data || error.message);
      }
    };

    checkBackendStatus();
  }, []);

  return (
    // Os seus Providers continuam a envolver a aplicação
    <AuthProvider>
      <ThemeProvider>
        {/* As suas rotas continuam aqui */}
        <Routes />
        
        {/* --- PASSO 2: Adicionar o ToastContainer aqui --- */}
        {/* Ele ficará "à escuta" de qualquer chamada `toast()` na aplicação */}
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
          theme="colored" // "light", "dark", or "colored"
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;