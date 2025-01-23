/// <reference types="node" />

import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { initialize as initializeStore } from './store';
import { registerAuthHandlers } from './handlers/auth';
import { registerRepoHandlers } from './handlers/repository';
import { registerSyncHandlers } from './handlers/sync';
import { registerAnalyticsHandlers } from './handlers/analytics';
import { startPythonBackend } from './backend';

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
      preload: join(__dirname, 'preload.js')
    }
  });

  // 开发环境加载本地服务，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

/**
 * 初始化应用
 */
async function initialize(): Promise<void> {
  try {
    // 初始化存储
    await initializeStore();
    
    // 启动Python后端服务
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

// 应用程序准备就绪时创建窗口
app.whenReady().then(initialize);

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS点击dock图标时重新创建窗口
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error: Error) => {
  console.error('未捕获的异常:', error);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('未处理的Promise拒绝:', reason);
}); 