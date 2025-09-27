// frontend/cadastro-funcionarios/src/pages/Login/index.js (VERSÃO COM NOVO DESIGN)

import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { toast } from 'react-toastify';

// Importando mais componentes e ícones do Material-UI
import { 
  Button, 
  TextField, 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Paper, 
  Avatar 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // Esta lógica agora funciona porque o signIn relança o erro
      await signIn({ email, senha });
    } catch (error) {
      // A mensagem de erro do backend será exibida instantaneamente
      const errorMessage = error.response?.data?.error || 'Credenciais inválidas. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* Usamos o Paper para criar o efeito de "cartão" com sombra */}
      <Paper 
        elevation={6} 
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2, // Bordas mais arredondadas
        }}
      >
        {/* Avatar com ícone para um visual mais profissional */}
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          PDV TechPriv
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
            disabled={loading}
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
            disabled={loading}
          />
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5 }} // Botão ligeiramente mais alto
            >
              Entrar
            </Button>
            {loading && (
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
      </Paper>
    </Container>
  );
};

export default Login;