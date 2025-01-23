import { ipcMain } from 'electron';
import { getStore } from '../services/store';
import {
  fetchGithubRepos,
  fetchGiteeRepos,
  addRepository,
  removeRepository,
  updateRepository,
  getSyncList,
} from '../services/repository';

/**
 * 注册仓库相关的IPC处理程序
 */
export function registerRepoHandlers(): void {
  // 获取GitHub仓库列表
  ipcMain.handle('repo:fetchGithubRepos', async (_event) => {
    try {
      const store = getStore();
      const token = store.get('github_token');
      if (!token) {
        throw new Error('未设置GitHub令牌');
      }
      return await fetchGithubRepos(token);
    } catch (error) {
      console.error('获取GitHub仓库列表失败:', error);
      throw error;
    }
  });

  // 获取Gitee仓库列表
  ipcMain.handle('repo:fetchGiteeRepos', async (_event) => {
    try {
      const store = getStore();
      const token = store.get('gitee_token');
      if (!token) {
        throw new Error('未设置Gitee令牌');
      }
      return await fetchGiteeRepos(token);
    } catch (error) {
      console.error('获取Gitee仓库列表失败:', error);
      throw error;
    }
  });

  // 添加仓库到同步列表
  ipcMain.handle('repo:addRepository', async (_event, repository) => {
    try {
      return await addRepository(repository);
    } catch (error) {
      console.error('添加仓库失败:', error);
      throw error;
    }
  });

  // 从同步列表移除仓库
  ipcMain.handle('repo:removeRepository', async (_event, id: string) => {
    try {
      return await removeRepository(id);
    } catch (error) {
      console.error('移除仓库失败:', error);
      throw error;
    }
  });

  // 更新仓库信息
  ipcMain.handle('repo:updateRepository', async (_event, id: string, updates) => {
    try {
      return await updateRepository(id, updates);
    } catch (error) {
      console.error('更新仓库失败:', error);
      throw error;
    }
  });

  // 获取同步列表
  ipcMain.handle('repo:getSyncList', async (_event) => {
    try {
      return await getSyncList();
    } catch (error) {
      console.error('获取同步列表失败:', error);
      throw error;
    }
  });
} 