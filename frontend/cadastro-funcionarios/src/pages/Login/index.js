// pdv-web-techpriv\frontend\cadastro-funcionarios\src\pages\Login\index.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';

// Importando componentes do Material-UI
import { Button, TextField, Box, Container, Typography } from '@mui/material';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn({ email, senha });
  };

  return (
    // Container centraliza o conteúdo na tela
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Typography é usado para textos */}
        <Typography component="h1" variant="h5">
          Login - PDV
        </Typography>
        
        {/* Box funciona como uma div, usamos 'form' para manter a semântica */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* TextField é o input de texto estilizado */}
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
          />
          {/* Button é o nosso botão estilizado */}
          <Button
            type="submit"
            fullWidth
            variant="contained" // 'contained' dá o estilo de botão primário
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;