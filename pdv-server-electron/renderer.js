// pdv-server-electron/renderer.js (VERSÃO ATUALIZADA)
const { ipcRenderer } = require('electron');

// Mapeamento dos elementos da interface
const backendStatusDot = document.getElementById('backend-status-dot');
const backendStatusText = document.getElementById('backend-status-text');
const frontendStatusDot = document.getElementById('frontend-status-dot');
const frontendStatusText = document.getElementById('frontend-status-text');
const toggleFrontendBtn = document.getElementById('toggle-frontend-btn');
const localUrlInput = document.getElementById('local-url');
const openFrontendBtn = document.getElementById('open-frontend-btn');
const logOutput = document.getElementById('log-output');

let isFrontendRunning = false;

// Botão para iniciar/parar o frontend
toggleFrontendBtn.addEventListener('click', () => {
    toggleFrontendBtn.disabled = true; // Desabilita o botão para evitar cliques duplos
    if (isFrontendRunning) {
        ipcRenderer.send('stop-frontend');
    } else {
        ipcRenderer.send('start-frontend');
    }
});

// Botão para abrir a URL no navegador padrão
openFrontendBtn.addEventListener('click', () => {
    ipcRenderer.send('open-frontend-url');
});

// --- OUVINTES DE EVENTOS DO PROCESSO PRINCIPAL ---

ipcRenderer.on('backend-status', (event, status) => {
    backendStatusText.textContent = status;
    backendStatusDot.className = `status-dot ${status.toLowerCase()}`;
});

ipcRenderer.on('frontend-status', (event, status) => {
    isFrontendRunning = status === 'Online';
    frontendStatusText.textContent = status;
    frontendStatusDot.className = `status-dot ${status.toLowerCase()}`;
    toggleFrontendBtn.textContent = isFrontendRunning ? 'Parar Frontend' : 'Iniciar Frontend';
    toggleFrontendBtn.className = isFrontendRunning ? 'btn-danger' : 'btn-primary';
    toggleFrontendBtn.disabled = false; // Reabilita o botão
});

ipcRenderer.on('network-info', (event, ip) => {
    if (ip) {
        localUrlInput.value = `http://${ip}:3000`;
    } else {
        localUrlInput.value = 'Não foi possível detectar o IP.';
    }
});

ipcRenderer.on('log', (event, message) => {
    const now = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${now}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
});