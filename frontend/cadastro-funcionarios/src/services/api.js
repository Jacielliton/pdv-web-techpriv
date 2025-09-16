//pdv-web-techpriv\frontend\cadastro-funcionarios\src\services\api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

// Este interceptor é um "plano B" caso o `useEffect` do AuthContext ainda não tenha rodado.
// Ele garante que CADA requisição verifique o token mais recente no storage.
api.interceptors.request.use(config => {
  // Use a MESMA chave que você definiu no seu AuthContext
  const token = localStorage.getItem('@PDV:token'); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;