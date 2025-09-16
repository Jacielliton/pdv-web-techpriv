// frontend/src/contexts/auth.js (versão atualizada)

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caixaStatus, setCaixaStatus] = useState('FECHADO');
  const [loadingCaixa, setLoadingCaixa] = useState(true);

  useEffect(() => {
    // --- NOVO: INTERCEPTOR PARA AUTO-LOGOUT ---
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Se qualquer chamada der 401, o token é inválido. Desloga o usuário.
          signOut();
        }
        return Promise.reject(error);
      }
    );

    async function loadStorageData() {
      const storagedUser = localStorage.getItem('@PDV:user');
      const storagedToken = localStorage.getItem('@PDV:token');

      if (storagedToken && storagedUser) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
        await checkCaixaStatus();
      }
      setLoading(false);
    }

    loadStorageData();

    // Limpa o interceptor quando o componente é desmontado
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  async function checkCaixaStatus() {
    setLoadingCaixa(true);
    try {
      const response = await api.get('/caixa/status');
      setCaixaStatus(response.data.status);
    } catch (error) {
      console.error("Erro ao verificar status do caixa", error);
      // Não precisa deslogar aqui, o interceptor já faz isso.
    } finally {
      setLoadingCaixa(false);
    }
  }

  async function abrirCaixa(valorInicial) {
    try {
      await api.post('/caixa/abrir', { valor_inicial: valorInicial });
      await checkCaixaStatus();
    } catch (error) {
      throw error;
    }
  }

  async function signIn(credentials) {
    try {
      const response = await axios.post('http://localhost:3333/api/login', credentials);
      const { funcionario, token } = response.data;
      
      localStorage.setItem('@PDV:user', JSON.stringify(funcionario)); 
      localStorage.setItem('@PDV:token', token);
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(funcionario);
      
      // Após o login, verifica imediatamente o status do caixa
      await checkCaixaStatus();

    } catch (error) {
      throw error; 
    }
  }

  function signOut() {
    localStorage.removeItem('@PDV:user');
    localStorage.removeItem('@PDV:token');
    delete api.defaults.headers.Authorization;
    setUser(null);
    setCaixaStatus('FECHADO'); // Reseta o status do caixa no logout
  }
  
  const signed = !!user; 
  const isManager = user?.cargo === 'gerente';

  return (
    <AuthContext.Provider 
      value={{ 
        signed, 
        user, 
        loading, 
        signIn, 
        signOut,        
        isManager,
        // --- EXPORTANDO NOVOS VALORES ---
        caixaStatus,
        loadingCaixa,
        abrirCaixa
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}