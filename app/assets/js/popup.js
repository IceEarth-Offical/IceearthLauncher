const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;
let notificationWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './scripts/renderer.js'),
        },
    });

    mainWindow.loadFile('./assets/index.html');

    checkNotification();
}

async function checkNotification() {
    const lastClosed = localStorage.getItem('lastClosed');
    const now = new Date();

    if (!lastClosed || (now - new Date(lastClosed)) / (1000 * 60 * 60 * 24) > 1) {
        const notificationData = await fetchNotification();
        createNotificationWindow(notificationData);
    }
}

async function fetchNotification() {
    try {
        const response = await axios.get('https://iceearth-offical.github.io/FTP/notification/iceearth_survive.json');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notification:', error);
        return { title: 'Error', message: 'Failed to load notification.' };
    }
}

function createNotificationWindow(notificationData) {
    notificationWindow = new BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
        },
    });

    notificationWindow.loadFile('./assets/notification.html');
    notificationWindow.webContents.on('did-finish-load', () => {
        notificationWindow.webContents.send('notification-data', notificationData);
    });
}

app.on('ready', createMainWindow);

ipcMain.on('dismiss-notification', () => {
    localStorage.setItem('lastClosed', new Date());
    if (notificationWindow) {
        notificationWindow.close();
    }
});
