// src/App.js
import React, { useEffect } from 'react';
import Routes from './routes';
import axios from 'axios'; // Importe o axios se ainda não tiver
import { AuthProvider } from './contexts/auth';
import { ThemeProvider } from './contexts/theme'; 

function App() {
  // useEffect para verificar a saúde do backend
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Faz a chamada para a nova rota de status
        const response = await axios.get('http://localhost:3333/api/status');
        console.log('✅ STATUS DO BACKEND:', response.data);
      } catch (error) {
        // Se der erro, o backend está fora do ar ou com problemas
        console.error('❌ ERRO: Não foi possível conectar ao Backend.', error.response?.data || error.message);
      }
    };

    checkBackendStatus();
  }, []); // O array vazio [] faz com que rode apenas uma vez

  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;