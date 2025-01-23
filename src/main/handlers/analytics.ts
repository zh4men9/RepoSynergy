import { ipcMain } from 'electron';
import { 
  getRepositoryStats,
  getLanguageStats,
  getContributionStats,
  getDependencyStats,
  RepositoryStats,
  LanguageStats,
  ContributionStats,
  DependencyStats
} from '../services/analytics';

/**
 * 注册分析相关的IPC处理程序
 */
export function registerAnalyticsHandlers(): void {
  // 获取仓库统计信息
  ipcMain.handle('analytics:repoStats', async (_event, repoId: string): Promise<RepositoryStats> => {
    try {
      return await getRepositoryStats(repoId);
    } catch (error) {
      console.error('获取仓库统计信息失败:', error);
      throw error;
    }
  });

  // 获取语言统计信息
  ipcMain.handle('analytics:languageStats', async (_event, repoId: string): Promise<LanguageStats> => {
    try {
      return await getLanguageStats(repoId);
    } catch (error) {
      console.error('获取语言统计信息失败:', error);
      throw error;
    }
  });

  // 获取贡献统计信息
  ipcMain.handle('analytics:contributionStats', async (_event, repoId: string): Promise<ContributionStats> => {
    try {
      return await getContributionStats(repoId);
    } catch (error) {
      console.error('获取贡献统计信息失败:', error);
      throw error;
    }
  });

  // 获取依赖统计信息
  ipcMain.handle('analytics:dependencyStats', async (_event, repoId: string): Promise<DependencyStats> => {
    try {
      return await getDependencyStats(repoId);
    } catch (error) {
      console.error('获取依赖统计信息失败:', error);
      throw error;
    }
  });
} 