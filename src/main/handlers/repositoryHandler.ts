import { ipcMain } from 'electron';
import { getGithubRepos, getGiteeRepos } from '../services/repository';
import type { Repository } from '../../types/electron';

export function setupRepositoryHandlers() {
  ipcMain.handle('repository:fetchGithubRepos', async () => {
    try {
      const repos = await getGithubRepos();
      return repos;
    } catch (error) {
      console.error('获取 GitHub 仓库列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('repository:fetchGiteeRepos', async () => {
    try {
      const repos = await getGiteeRepos();
      return repos;
    } catch (error) {
      console.error('获取 Gitee 仓库列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('repository:addToSync', async (_, repo: Repository) => {
    try {
      // TODO: 实现添加仓库到同步列表的逻辑
      return { success: true };
    } catch (error) {
      console.error('添加仓库到同步列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('repository:removeFromSync', async (_, repoId: string) => {
    try {
      // TODO: 实现从同步列表移除仓库的逻辑
      return { success: true };
    } catch (error) {
      console.error('从同步列表移除仓库失败:', error);
      throw error;
    }
  });
} 