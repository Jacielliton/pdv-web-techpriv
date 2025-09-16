// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\Login\index.js (VERSÃO CORRIGIDA)

import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { toast } from 'react-toastify'; // Importe o toast para as mensagens

// Importando componentes do Material-UI
import { Button, TextField, Box, Container, Typography, CircularProgress } from '@mui/material';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); // Estado para controlar o carregamento

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Previne múltiplos envios

    setLoading(true);

    try {
      // Tenta fazer o login
      await signIn({ email, senha });
      // Se o login for bem-sucedido, o AuthContext cuidará do redirecionamento
    } catch (error) {
      // Se o signIn falhar (erro 401), ele será capturado aqui
      toast.error('Usuário ou senha inválidos. Tente novamente.');
    } finally {
      // Garante que o loading seja desativado, mesmo se der erro
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login - PDV
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} // Desabilita o campo durante o carregamento
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading} // Desabilita o campo durante o carregamento
          />
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading} // Desabilita o botão durante o carregamento
            >
              Entrar
            </Button>
            {loading && ( // Mostra o indicador de progresso se estiver carregando
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;