// pdv-server-electron/main.js (VERSÃO FINAL E CORRIGIDA)
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const os = require('os');
const express = require('express');

let mainWindow;
let backendProcess;
let frontendServer; 

function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.on('closed', () => { mainWindow = null; });
    
    mainWindow.webContents.on('did-finish-load', () => {
        const ip = getIPAddress();
        if (mainWindow) {
            mainWindow.webContents.send('network-info', ip);
        }
    });
}

function sendLog(message) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('log', message.trim());
    }
    console.log(message.trim());
}

function startBackend() {
    const backendDir = app.isPackaged 
        ? path.resolve(app.getAppPath(), '..', 'backend') 
        : path.resolve(__dirname, '..', 'backend');
    
    const scriptPath = path.join(backendDir, 'src', 'server.js');

    sendLog(`Iniciando Backend...`);
    backendProcess = fork(scriptPath, [], { cwd: backendDir, silent: true });
    
    backendProcess.stdout.on('data', (data) => sendLog(`[Backend]: ${data.toString()}`));
    backendProcess.stderr.on('data', (data) => sendLog(`[Backend ERROR]: ${data.toString()}`));

    backendProcess.on('spawn', () => {
        if (mainWindow) mainWindow.webContents.send('backend-status', 'Online');
    });
    backendProcess.on('exit', () => {
        sendLog(`Backend finalizado.`);
        if (mainWindow) mainWindow.webContents.send('backend-status', 'Offline');
    });
}

// ---> FUNÇÃO SIMPLIFICADA SEM A LINHA DO ERRO <---
function startFrontend() {
    if (frontendServer) return;

    const frontendBuildDir = app.isPackaged
        ? path.resolve(app.getAppPath(), '..', 'frontend_build')
        : path.resolve(__dirname, '..', 'frontend', 'cadastro-funcionarios', 'build');

    sendLog('Iniciando Servidor Frontend com Express...');
    if (mainWindow) mainWindow.webContents.send('frontend-status', 'Iniciando');

    const expressApp = express();
    // Apenas esta linha é necessária para servir o frontend
    expressApp.use(express.static(frontendBuildDir));

    const PORT = 3000;
    frontendServer = expressApp.listen(PORT, '0.0.0.0', () => {
        sendLog(`[Frontend]: Servidor rodando em http://localhost:${PORT} e na rede.`);
        if (mainWindow) mainWindow.webContents.send('frontend-status', 'Online');
    }).on('error', (err) => {
        sendLog(`[Frontend ERROR]: Falha ao iniciar o servidor. A porta 3000 pode já estar em uso?`);
        if (mainWindow) mainWindow.webContents.send('frontend-status', 'Erro');
    });
}

function stopFrontend() {
    if (frontendServer) {
        sendLog('Parando Servidor Frontend...');
        frontendServer.close(() => {
            sendLog('Servidor Frontend finalizado.');
            if (mainWindow) {
                mainWindow.webContents.send('frontend-status', 'Offline');
            }
            frontendServer = null;
        });
    }
}

app.on('ready', () => {
    createWindow();
    startBackend();
});

app.on('window-all-closed', () => app.quit());

app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill();
    stopFrontend();
});

ipcMain.on('start-frontend', startFrontend);
ipcMain.on('stop-frontend', stopFrontend);
ipcMain.on('open-frontend-url', () => {
    const ip = getIPAddress();
    shell.openExternal(`http://${ip}:3000`);
});