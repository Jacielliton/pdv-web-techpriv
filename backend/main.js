// backend/main.js (VERSÃO FINAL COMPLETA E CORRIGIDA)
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

try {
    let mainWindow;

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
            height: 700, // Aumentei um pouco a altura para acomodar o tutorial
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        mainWindow.loadFile(path.join(__dirname, 'control-panel.html'));
        mainWindow.on('closed', () => { mainWindow = null; });
    }

    async function startServer() {
        const log = (message) => {
            console.log(message);
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('log', message);
            }
        };
        const updateStatus = (status) => {
            if (mainWindow && mainWindow.webContents) {
                const ip = getIPAddress();
                mainWindow.webContents.send('server-status', status, ip, 3333);
            }
        };

        try {
            // PASSO 1: Definir o caminho do DB ANTES de carregar qualquer módulo do servidor
            const userDataPath = app.getPath('userData');
            process.env.DB_STORAGE_PATH = path.join(userDataPath, 'database.sqlite');
            log(`Usando banco de dados em: ${process.env.DB_STORAGE_PATH}`);

            // Copia o banco de dados modelo, se necessário
            if (!fs.existsSync(process.env.DB_STORAGE_PATH)) {
                const templateDbPath = app.isPackaged 
                    ? path.join(process.resourcesPath, 'database.sqlite') 
                    : path.resolve(__dirname, 'database.sqlite');
                if (fs.existsSync(templateDbPath)) {
                    fs.copyFileSync(templateDbPath, process.env.DB_STORAGE_PATH);
                    log('Banco de dados inicial copiado com sucesso.');
                }
            }
            
            // PASSO 2: Carregar os módulos do servidor AGORA que o caminho do DB está definido
            const express = require('express');
            const cors = require('cors');
            const sequelize = require('./src/config/database');
            const routes = require('./src/routes/index');
            const applyAssociations = require('./src/models/associations');
            const createAdminUser = require('./src/database/seeders/admin-user');

            // PASSO 3: Configurar e iniciar o servidor Express
            const expressApp = express();
            expressApp.use(cors({ origin: '*' }));
            expressApp.use(express.json());
            applyAssociations();
            expressApp.use('/api', routes);

            const frontendBuildPath = app.isPackaged 
                ? path.resolve(process.resourcesPath, 'frontend/cadastro-funcionarios/build') 
                : path.resolve(__dirname, '..', 'frontend', 'cadastro-funcionarios', 'build');
            expressApp.use(express.static(frontendBuildPath));
            expressApp.get('*', (req, res) => {
                res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
            });

            await sequelize.authenticate();
            log('✅ Conexão com o banco de dados estabelecida com sucesso.');
            await createAdminUser();
            
            const PORT = 3333;
            expressApp.listen(PORT, '0.0.0.0', () => {
                log(`🚀 Servidor unificado rodando na porta ${PORT}`);
                updateStatus('Online');
            });

        } catch (error) {
            const errorMsg = `❌ Falha ao iniciar o servidor: ${error.stack || error.toString()}`;
            log(errorMsg);
            updateStatus('Erro');
            dialog.showErrorBox('Erro na Inicialização do Servidor', errorMsg);
        }
    }

    app.on('ready', () => {
        createWindow();
        startServer();
    });

    app.on('window-all-closed', () => app.quit());

    ipcMain.on('open-url', () => {
        const ip = getIPAddress();
        shell.openExternal(`http://${ip}:3333`);
    });

} catch (e) {
    dialog.showErrorBox('Erro Crítico no Processo Principal', e.stack || e.toString());
}