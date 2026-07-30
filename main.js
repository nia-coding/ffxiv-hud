const { app, BrowserWindow, ipcMain, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const TASKS_PATH = path.join(__dirname, 'tasks.json');

let mainWindow = null;
let watchHandle = null;
let reloadTimer = null;

function readTasks() {
  try {
    const raw = fs.readFileSync(TASKS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return {
      error: `Unable to read tasks.json: ${error.message}`,
      mainQuest: {
        title: '任务数据读取失败',
        objective: '请检查 tasks.json',
        details: error.stack || error.message
      },
      sideQuests: []
    };
  }
}

function sendTasks() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('tasks:update', readTasks());
}

function watchTasks() {
  if (watchHandle) {
    watchHandle.close();
  }

  watchHandle = fs.watch(TASKS_PATH, { persistent: true }, () => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(sendTasks, 120);
  });
}

function createWindow() {
  const { bounds } = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.webContents.once('did-finish-load', sendTasks);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  watchTasks();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on('hud:set-ignore-mouse-events', (_event, ignore) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
});

app.on('before-quit', () => {
  clearTimeout(reloadTimer);
  if (watchHandle) {
    watchHandle.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
