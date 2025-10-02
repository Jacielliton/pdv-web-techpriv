// pdv-web-techpriv\frontend\cadastro-funcionarios\src\services\api.js (VERSÃO FINAL E AUTOMÁTICA)
import axios from 'axios';

// Esta variável especial (NODE_ENV) é definida automaticamente pelo React
// 'development' quando você usa 'npm start'
// 'production' quando você usa 'npm run build' (ou 'npm run electron:dist')
const baseURL = process.env.NODE_ENV === 'development'
  ? '/api' // Em desenvolvimento, usa o proxy para o Ngrok funcionar
  : 'http://localhost:3333/api'; // Na versão final (.exe), aponta direto para o localhost

const api = axios.create({
  baseURL: baseURL,
});

// Este interceptor continua o mesmo
api.interceptors.request.use(config => {
  const token = localStorage.getItem('@PDV:token'); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;