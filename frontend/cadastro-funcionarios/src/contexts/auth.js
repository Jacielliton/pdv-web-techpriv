// frontend/cadastro-funcionarios/src/contexts/auth.js (VERSÃO COMPLETA E CORRIGIDA)
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- Estados que estavam faltando para gerenciar o caixa ---
  const [caixaStatus, setCaixaStatus] = useState('FECHADO');
  const [loadingCaixa, setLoadingCaixa] = useState(true);

  useEffect(() => {
    // Interceptor para deslogar automaticamente se o token for inválido
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
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
        await checkCaixaStatus(); // Verifica o status do caixa ao carregar a página
      }
      setLoading(false);
    }

    loadStorageData();

    // Limpa o interceptor ao desmontar
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Função para verificar o status do caixa no backend
  async function checkCaixaStatus() {
    setLoadingCaixa(true);
    try {
      const response = await api.get('/caixa/status');
      setCaixaStatus(response.data.status);
    } catch (error) {
      console.error("Erro ao verificar status do caixa", error);
      setCaixaStatus('FECHADO'); // Assume fechado em caso de erro
    } finally {
      setLoadingCaixa(false);
    }
  }

  // Função para abrir o caixa
  async function abrirCaixa(valorInicial) {
    try {
      await api.post('/caixa/abrir', { valor_inicial: valorInicial });
      await checkCaixaStatus(); // Re-verifica o status após abrir
    } catch (error) {
      console.error("Erro ao abrir caixa", error);
      throw error;
    }
  }
  
  // Função para ser chamada após fechar o caixa
  async function atualizarCaixaStatus() {
    await checkCaixaStatus();
  }

  async function signIn(credentials) {
    try {
      const response = await axios.post('http://localhost:3333/api/login', credentials);
      const { funcionario, token } = response.data;
      
      localStorage.setItem('@PDV:user', JSON.stringify(funcionario));
      localStorage.setItem('@PDV:token', token);
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(funcionario);
      
      await checkCaixaStatus(); // Verifica o status do caixa logo após o login
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

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!user, 
        user, 
        isManager: user?.cargo === 'gerente',
        loading, 
        signIn, 
        signOut,
        // --- Informações do caixa que estavam faltando ---
        caixaStatus,
        loadingCaixa,
        abrirCaixa,
        atualizarCaixaStatus
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