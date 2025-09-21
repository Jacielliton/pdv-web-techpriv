// frontend/cadastro-funcionarios/src/contexts/theme.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Cria o Contexto
const ThemeContext = createContext();

// 2. Cria o Provedor
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        // --- ADICIONE ESTE BLOCO ---
        // Vamos adicionar keyframes de animação reutilizáveis ao tema
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              @keyframes highlight-add {
                0% {
                  background-color: transparent;
                }
                50% {
                  background-color: #2e7d3230; /* Verde bem claro */
                }
                100% {
                  background-color: transparent;
                }
              }
            `,
          },
        },
        // --- FIM DO BLOCO ADICIONADO ---
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};