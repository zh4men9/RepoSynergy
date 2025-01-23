import { ipcMain } from 'electron';
import store from '../store';
import { 
  startSync,
  stopSync,
  getSyncStatus,
  SyncStatus,
  SyncResult
} from '../services/sync';

/**
 * 注册同步相关的IPC处理程序
 */
export function registerSyncHandlers(): void {
  // 开始同步
  ipcMain.handle('sync:start', async (_event, repoId: string): Promise<SyncResult> => {
    try {
      const repos = store.get('repositories', []);
      const repo = repos.find(r => r.id === repoId);
      if (!repo) {
        throw new Error('仓库不存在');
      }
      
      const result = await startSync(repo);
      
      // 更新最后同步时间
      store.set('repositories', repos.map(r => 
        r.id === repoId 
          ? { ...r, lastSyncTime: new Date().toISOString() }
          : r
      ));
      
      return result;
    } catch (error) {
      console.error('开始同步失败:', error);
      throw error;
    }
  });

  // 停止同步
  ipcMain.handle('sync:stop', async (_event, repoId: string): Promise<void> => {
    try {
      await stopSync(repoId);
    } catch (error) {
      console.error('停止同步失败:', error);
      throw error;
    }
  });

  // 获取同步状态
  ipcMain.handle('sync:status', async (_event, repoId: string): Promise<SyncStatus> => {
    try {
      return await getSyncStatus(repoId);
    } catch (error) {
      console.error('获取同步状态失败:', error);
      throw error;
    }
  });

  // 设置同步间隔
  ipcMain.handle('sync:setInterval', async (_event, interval: number): Promise<void> => {
    try {
      store.set('settings.syncInterval', interval);
    } catch (error) {
      console.error('设置同步间隔失败:', error);
      throw error;
    }
  });

  // 获取同步间隔
  ipcMain.handle('sync:getInterval', async (): Promise<number> => {
    return store.get('settings.syncInterval', 3600000); // 默认1小时
  });
} 