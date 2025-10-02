// VERSÃO FINAL CORRIGIDA - COLE ISTO NO SEU electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend(resourcesPath) {
  const backendPath = path.join(resourcesPath, 'backend', 'src', 'server.js');
  
  // ---> INÍCIO DA CORREÇÃO <---
  // Define o diretório de trabalho para a pasta 'backend'
  const options = {
    cwd: path.resolve(resourcesPath, 'backend')
  };
  // ---> FIM DA CORREÇÃO <---

  console.log(`Iniciando backend em: ${backendPath}`);
  console.log(`Diretório de trabalho definido para: ${options.cwd}`);
  
  // Passamos as 'options' para o fork
  backendProcess = fork(backendPath, [], options);

  backendProcess.on('message', (msg) => console.log('Mensagem do Backend:', msg));
  backendProcess.on('error', (err) => console.error('Erro no Backend:', err));
  backendProcess.on('exit', (code) => console.log(`Backend finalizado com código ${code}`));
}

// A função createWindow precisa ser 'async' para usar 'await import()'
async function createWindow() {
  const { default: isDev } = await import('electron-is-dev');

  if (!isDev) {
    startBackend(process.resourcesPath);
  }

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'logo192.png'),
    autoHideMenuBar: true,
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'index.html')}`;

  console.log(`Carregando frontend de: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    console.log('Finalizando processo do backend...');
    backendProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});