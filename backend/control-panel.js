const { ipcRenderer } = require('electron');

const serverStatusDot = document.getElementById('server-status-dot');
const serverStatusText = document.getElementById('server-status-text');
const localUrlInput = document.getElementById('local-url');
const openUrlBtn = document.getElementById('open-url-btn');
const logOutput = document.getElementById('log-output');

openUrlBtn.addEventListener('click', () => {
    ipcRenderer.send('open-url');
});

ipcRenderer.on('server-status', (event, status, ip, port) => {
    serverStatusText.textContent = status;
    serverStatusDot.className = `status-dot ${status.toLowerCase()}`;
    if (status === 'Online') {
        localUrlInput.value = `http://${ip}:${port}`;
    }
});

ipcRenderer.on('log', (event, message) => {
    const now = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${now}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
});