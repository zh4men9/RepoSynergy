/// <reference types="node" />

import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { startPythonBackend, stopPythonBackend } from './services/pythonBackend';
import { registerAuthHandlers } from './handlers/authHandler';
import { registerRepoHandlers } from './handlers/repoHandler';
import { registerSyncHandlers } from './handlers/syncHandler';
import { registerAnalyticsHandlers } from './handlers/analyticsHandler';
import { initializeStore } from './services/store';

/**
 * 主窗口实例
 */
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
async function createWindow(): Promise<void> {
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

  // 加载应用
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.show();
}

/**
 * 初始化应用
 */
async function initialize(): Promise<void> {
  try {
    // 初始化存储
    await initializeStore();

    // 启动Python后端
    await startPythonBackend();

    // 注册IPC处理程序
    registerAuthHandlers();
    registerRepoHandlers();
    registerSyncHandlers();
    registerAnalyticsHandlers();

    // 创建窗口
    await createWindow();
  } catch (error) {
    console.error('初始化失败:', error);
    app.quit();
  }
}

// 应用程序就绪时
app.whenReady().then(initialize);

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 激活应用时
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 应用退出时
app.on('before-quit', async () => {
  await stopPythonBackend();
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
}); 