// frontend/cadastro-funcionarios/src/contexts/theme.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Cria o Contexto
const ThemeContext = createContext();

// 2. Cria o Provedor
export const ThemeProvider = ({ children }) => {
  // Tenta buscar o tema salvo no navegador, ou usa 'light' como padrão
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  // Salva a preferência do tema no navegador sempre que o modo mudar
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Cria o tema do Material-UI baseado no modo atual
  // useMemo garante que o tema só seja recalculado quando o 'mode' mudar
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, // A mágica do MUI acontece aqui!
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline /> {/* Normaliza o CSS e aplica cores de fundo/texto do tema */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

// 3. Cria o Hook para usar o contexto facilmente
export const useTheme = () => {
  return useContext(ThemeContext);
};