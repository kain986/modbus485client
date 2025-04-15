const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let modbusClient = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            //preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (modbusClient && modbusClient.isOpen) {
            modbusClient.close();
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// --- GESTIONE DELLA COMUNICAZIONE SERIALE E MODBUS ---
ipcMain.handle('list-serial-ports', async () => {
    const { SerialPort } = require('serialport');
    try {
        const ports = await SerialPort.list();
        return ports.map(port => port.path);
    } catch (err) {
        console.error('Errore durante la listatura delle porte seriali:', err);
        return [];
    }
});

ipcMain.handle('connect-modbus', async (event, portName, baudRate, parity, stopBits, dataBits, slaveAddress) => {
    const ModbusRTU = require('modbus-serial');
    modbusClient = new ModbusRTU();
    modbusClient.setTimeout(5000);

    try {
        await modbusClient.connectRTUBuffered(portName, { baudRate, parity, stopBits, dataBits });
        modbusClient.setID(slaveAddress);
        return true;
    } catch (err) {
        console.error('Errore di connessione Modbus:', err);
        modbusClient = null;
        return false;
    }
});

ipcMain.handle('disconnect-modbus', async () => {
    if (modbusClient && modbusClient.isOpen) {
        try {
            await modbusClient.close();
            modbusClient = null;
            return true;
        } catch (err) {
            console.error('Errore durante la disconnessione Modbus:', err);
            return false;
        }
    }
    return true;
});

ipcMain.handle('read-register', async (event, address) => {
    if (modbusClient && modbusClient.isOpen) {
        try {
            const data = await modbusClient.readHoldingRegisters(address, 1);
            return data.data[0];
        } catch (err) {
            console.error('Errore durante la lettura del registro:', err);
            return null;
        }
    } else {
        console.error('Modbus non connesso.');
        return null;
    }
});

ipcMain.handle('write-register', async (event, address, value) => {
    if (modbusClient && modbusClient.isOpen) {
        try {
            await modbusClient.writeRegister(address, [value]);
            return true;
        } catch (err) {
            console.error('Errore durante la scrittura nel registro:', err);
            return false;
        }
    } else {
        console.error('Modbus non connesso.');
        return false;
    }
});

// --- GESTIONE SALVATAGGIO E CARICAMENTO CONFIGURAZIONE CON DIALOGHI ---
ipcMain.handle('show-save-dialog', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Salva Configurazione',
        defaultPath: path.join(app.getPath('documents'), 'modbus_config.json'),
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.canceled ? null : result.filePath;
});

ipcMain.handle('save-config', async (event, config, filePath) => {
    if (!filePath) {
        return false; // L'utente ha annullato la finestra di dialogo
    }
    try {
        await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Errore durante il salvataggio della configurazione:', error);
        return false;
    }
});

ipcMain.handle('show-open-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Carica Configurazione',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('load-config', async (event, filePath) => {
    if (!filePath) {
        return []; // L'utente ha annullato la finestra di dialogo
    }
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Errore durante il caricamento della configurazione:', error);
        return [];
    }
});