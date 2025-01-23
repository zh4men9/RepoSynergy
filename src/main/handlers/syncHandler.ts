import { ipcMain } from 'electron';
import { getStore } from '../services/store';
import {
  startSync,
  stopSync,
  getSyncStatus,
  setSyncInterval,
  getSyncInterval,
} from '../services/sync';

/**
 * 注册同步相关的IPC处理程序
 */
export function registerSyncHandlers(): void {
  // 开始同步
  ipcMain.handle('sync:start', async (_event, repositoryId: string) => {
    try {
      return await startSync(repositoryId);
    } catch (error) {
      console.error('开始同步失败:', error);
      throw error;
    }
  });

  // 停止同步
  ipcMain.handle('sync:stop', async (_event, repositoryId: string) => {
    try {
      return await stopSync(repositoryId);
    } catch (error) {
      console.error('停止同步失败:', error);
      throw error;
    }
  });

  // 获取同步状态
  ipcMain.handle('sync:getStatus', async (_event, repositoryId: string) => {
    try {
      return await getSyncStatus(repositoryId);
    } catch (error) {
      console.error('获取同步状态失败:', error);
      throw error;
    }
  });

  // 设置同步间隔
  ipcMain.handle('sync:setInterval', async (_event, minutes: number) => {
    try {
      return await setSyncInterval(minutes);
    } catch (error) {
      console.error('设置同步间隔失败:', error);
      throw error;
    }
  });

  // 获取同步间隔
  ipcMain.handle('sync:getInterval', async (_event) => {
    try {
      return await getSyncInterval();
    } catch (error) {
      console.error('获取同步间隔失败:', error);
      throw error;
    }
  });
} 