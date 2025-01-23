import { ipcMain } from 'electron';
import {
  getRepositoryStats,
  getLanguageStats,
  getContributionStats,
  getDependencyStats,
} from '../services/analytics';

/**
 * 注册分析相关的IPC处理程序
 */
export function registerAnalyticsHandlers(): void {
  // 获取仓库统计信息
  ipcMain.handle('analytics:getRepositoryStats', async (_event, repositoryId: string) => {
    try {
      return await getRepositoryStats(repositoryId);
    } catch (error) {
      console.error('获取仓库统计信息失败:', error);
      throw error;
    }
  });

  // 获取语言统计信息
  ipcMain.handle('analytics:getLanguageStats', async (_event, repositoryId: string) => {
    try {
      return await getLanguageStats(repositoryId);
    } catch (error) {
      console.error('获取语言统计信息失败:', error);
      throw error;
    }
  });

  // 获取贡献统计信息
  ipcMain.handle('analytics:getContributionStats', async (_event, repositoryId: string) => {
    try {
      return await getContributionStats(repositoryId);
    } catch (error) {
      console.error('获取贡献统计信息失败:', error);
      throw error;
    }
  });

  // 获取依赖统计信息
  ipcMain.handle('analytics:getDependencyStats', async (_event, repositoryId: string) => {
    try {
      return await getDependencyStats(repositoryId);
    } catch (error) {
      console.error('获取依赖统计信息失败:', error);
      throw error;
    }
  });
} 