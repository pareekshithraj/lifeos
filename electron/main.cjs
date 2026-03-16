const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Register Deep Link Protocol
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('lifeos', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('lifeos');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();

            const url = commandLine.find(arg => arg.startsWith('lifeos://'));
            if (url) {
                mainWindow.webContents.send('deep-link', url);
            }
        }
    });

    app.whenReady().then(() => {
        createWindow();
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        title: "Life OS",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.cjs')
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Allow Google Auth and Firebase Auth popups to open within Electron
        console.log("Opening popup for url:", url);
        if (url.startsWith('https://accounts.google.com') ||
            url.startsWith('https://eliment-lifeos.firebaseapp.com')) {
            return { action: 'allow' };
        }

        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
        mainWindow.webContents.send('deep-link', url);
    }
});
