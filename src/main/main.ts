/// <reference types="node" />

import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { setupAuthHandlers } from './handlers/authHandler';
import { setupRepositoryHandlers } from './handlers/repositoryHandler';
import { setupSyncHandlers } from './handlers/syncHandler';
import { initializeStore } from './services/store';

/**
 * 主窗口实例
 */
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 初始化应用
 */
async function initialize(): Promise<void> {
  try {
    // 初始化存储
    await initializeStore();

    // 创建窗口
    createWindow();

    // 注册IPC处理程序
    setupAuthHandlers();
    setupRepositoryHandlers();
    setupSyncHandlers();
  } catch (error) {
    console.error('初始化失败:', error);
    app.quit();
  }
}

// 应用程序就绪时
app.whenReady().then(() => {
  initialize();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
}); 