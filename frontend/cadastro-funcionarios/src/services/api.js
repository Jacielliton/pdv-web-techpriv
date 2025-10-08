// pdv-web-techpriv\frontend\cadastro-funcionarios\src\services\api.js (VERSÃO FINAL PARA REDE LOCAL)
import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
let baseURL;

if (isDevelopment) {
  // Se estamos em desenvolvimento e acessando de um IP na rede (não localhost)...
  if (window.location.hostname !== 'localhost') {
    // ...construímos a URL do backend usando o mesmo IP.
    baseURL = `http://${window.location.hostname}:3333/api`;
  } else {
    // Se estamos em localhost, usamos o proxy (caminho relativo).
    baseURL = '/api';
  }
} else {
  // Na versão final compilada (.exe), o backend sempre estará em localhost.
  baseURL = 'http://localhost:3333/api';
}

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