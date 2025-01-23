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
export function setupSyncHandlers(): void {
  // 开始同步
  ipcMain.handle('sync:start', async (_event, repositoryId: string) => {
    try {
      const result = await startSync(repositoryId);
      return result;
    } catch (error) {
      console.error('启动同步失败:', error);
      throw error;
    }
  });

  // 停止同步
  ipcMain.handle('sync:stop', async (_event, repositoryId: string) => {
    try {
      const result = await stopSync(repositoryId);
      return result;
    } catch (error) {
      console.error('停止同步失败:', error);
      throw error;
    }
  });

  // 获取同步状态
  ipcMain.handle('sync:status', async (_event, repositoryId: string) => {
    try {
      // TODO: 实现获取同步状态的逻辑
      return {
        status: 'idle',
        lastSync: undefined,
        error: undefined,
      };
    } catch (error) {
      console.error('获取同步状态失败:', error);
      throw error;
    }
  });

  // 设置同步间隔
  ipcMain.handle('sync:setInterval', async (_event, minutes: number) => {
    try {
      await setSyncInterval(minutes);
      return { success: true };
    } catch (error) {
      console.error('设置同步间隔失败:', error);
      throw error;
    }
  });

  // 获取同步间隔
  ipcMain.handle('sync:getInterval', async (_event) => {
    try {
      const interval = await getSyncInterval();
      return interval;
    } catch (error) {
      console.error('获取同步间隔失败:', error);
      throw error;
    }
  });
} 