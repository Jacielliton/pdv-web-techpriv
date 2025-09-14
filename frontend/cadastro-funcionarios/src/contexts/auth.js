import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Usado SOMENTE para a chamada de login pública
import api from '../services/api'; // ALTERAÇÃO 1: Importe a instância dedicada

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData() {
      const storagedUser = localStorage.getItem('@PDV:user');
      const storagedToken = localStorage.getItem('@PDV:token');

      if (storagedUser && storagedToken) {
        // ALTERAÇÃO CRÍTICA: Configure a instância 'api', não a global 'axios'
        api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    }
    loadStoragedData();
  }, []);

  async function signIn(credentials) {
    try {
      const response = await axios.post('http://localhost:3333/api/login', credentials);
      const { funcionario, token } = response.data;

      // Salva os dados no localStorage PRIMEIRO para garantir consistência
      localStorage.setItem('@PDV:user', JSON.stringify(funcionario));
      localStorage.setItem('@PDV:token', token);

      // ALTERAÇÃO CRÍTICA: Configure a instância 'api' após o login
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // Atualiza o estado da aplicação
      setUser(funcionario);

    } catch (error) {
      console.error('Erro no login:', error);
      // Re-lança o erro para o componente de Login poder tratar
      throw error; 
    }
  }

  function signOut() {
    localStorage.removeItem('@PDV:user');
    localStorage.removeItem('@PDV:token');
    
    // Boa prática: Limpe também o header da instância api
    delete api.defaults.headers.Authorization;

    setUser(null);
  }

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!user, 
        user, 
        loading, 
        signIn, 
        signOut,        
        isManager: user?.cargo === 'gerente' 
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