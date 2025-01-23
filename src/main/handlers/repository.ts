import { ipcMain } from 'electron';
import store from '../store';
import { 
  fetchGithubRepositories,
  fetchGiteeRepositories,
  addRepository,
  removeRepository,
  updateRepository
} from '../services/repository';

interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

/**
 * 注册仓库相关的IPC处理程序
 */
export function registerRepoHandlers(): void {
  // 获取GitHub仓库列表
  ipcMain.handle('repo:fetchGithub', async (): Promise<Repository[]> => {
    try {
      const token = store.get('auth.githubToken');
      if (!token) {
        throw new Error('未设置GitHub令牌');
      }
      return await fetchGithubRepositories(token);
    } catch (error) {
      console.error('获取GitHub仓库列表失败:', error);
      throw error;
    }
  });

  // 获取Gitee仓库列表
  ipcMain.handle('repo:fetchGitee', async (): Promise<Repository[]> => {
    try {
      const token = store.get('auth.giteeToken');
      if (!token) {
        throw new Error('未设置Gitee令牌');
      }
      return await fetchGiteeRepositories(token);
    } catch (error) {
      console.error('获取Gitee仓库列表失败:', error);
      throw error;
    }
  });

  // 添加仓库到同步列表
  ipcMain.handle('repo:add', async (_event, repository: Repository): Promise<void> => {
    try {
      await addRepository(repository);
      const repos = store.get('repositories', []);
      store.set('repositories', [...repos, repository]);
    } catch (error) {
      console.error('添加仓库失败:', error);
      throw error;
    }
  });

  // 从同步列表移除仓库
  ipcMain.handle('repo:remove', async (_event, id: string): Promise<void> => {
    try {
      await removeRepository(id);
      const repos = store.get('repositories', []);
      store.set('repositories', repos.filter(repo => repo.id !== id));
    } catch (error) {
      console.error('移除仓库失败:', error);
      throw error;
    }
  });

  // 更新仓库信息
  ipcMain.handle('repo:update', async (_event, repository: Repository): Promise<void> => {
    try {
      await updateRepository(repository);
      const repos = store.get('repositories', []);
      store.set('repositories', repos.map(repo => 
        repo.id === repository.id ? repository : repo
      ));
    } catch (error) {
      console.error('更新仓库失败:', error);
      throw error;
    }
  });

  // 获取同步列表
  ipcMain.handle('repo:getSyncList', async (): Promise<Repository[]> => {
    return store.get('repositories', []);
  });
} 