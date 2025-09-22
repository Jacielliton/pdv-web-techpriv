// src/hooks/useHotkeys.js
import { useEffect, useCallback } from 'react';

export const useHotkeys = (key, callback) => {
  const handleKeyDown = useCallback(
    (event) => {
      // Impede o comportamento padrão do navegador para a tecla (ex: F1 abrir ajuda)
      if (event.key === key) {
        event.preventDefault();
        callback();
      }
    },
    [key, callback] // O callback é recriado se a função mudar
  );

  useEffect(() => {
    // Adiciona o 'escutador' de eventos quando o componente é montado
    window.addEventListener('keydown', handleKeyDown);

    // IMPORTANTE: Remove o 'escutador' quando o componente é desmontado
    // Isso evita memory leaks e que os atalhos funcionem em outras telas
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // O efeito é re-executado se a função mudar
};