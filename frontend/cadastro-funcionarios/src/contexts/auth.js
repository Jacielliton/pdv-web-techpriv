// pdv-web-techpriv\frontend\cadastro-funcionarios\src\contexts\auth.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para carregar dados do usuário do localStorage ao iniciar
    async function loadStoragedData() {
      const storagedUser = localStorage.getItem('@PDV:user');
      const storagedToken = localStorage.getItem('@PDV:token');

      if (storagedUser && storagedToken) {
        // Seta o token no cabeçalho do axios para futuras requisições
        axios.defaults.headers.Authorization = `Bearer ${storagedToken}`;
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

      setUser(funcionario);
      
      // Seta o token no cabeçalho do axios para futuras requisições
      axios.defaults.headers.Authorization = `Bearer ${token}`;

      // Salva os dados no localStorage para persistir a sessão
      localStorage.setItem('@PDV:user', JSON.stringify(funcionario));
      localStorage.setItem('@PDV:token', token);

    } catch (error) {
      console.error('Erro no login:', error);
      alert('Falha no login, verifique suas credenciais.');
    }
  }

  function signOut() {
    localStorage.removeItem('@PDV:user');
    localStorage.removeItem('@PDV:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}