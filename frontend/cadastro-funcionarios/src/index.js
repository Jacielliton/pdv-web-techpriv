// pdv-web-techpriv\frontend\cadastro-funcionarios\src\index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/auth';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Envolva o App com o AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);