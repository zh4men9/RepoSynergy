import { ipcMain } from 'electron';
import { getStore } from '../services/store';
import { validateGithubToken, validateGiteeToken } from '../services/auth';

/**
 * 注册认证相关的IPC处理程序
 */
export function registerAuthHandlers(): void {
  // 设置GitHub令牌
  ipcMain.handle('auth:setGithubToken', async (_event, token: string) => {
    try {
      // 验证令牌
      const username = await validateGithubToken(token);
      if (!username) {
        throw new Error('GitHub令牌验证失败');
      }

      // 存储令牌和用户名
      const store = getStore();
      store.set('github_token', token);
      store.set('github_username', username);

      return { success: true, username };
    } catch (error) {
      console.error('设置GitHub令牌失败:', error);
      throw error;
    }
  });

  // 设置Gitee令牌
  ipcMain.handle('auth:setGiteeToken', async (_event, token: string) => {
    try {
      // 验证令牌
      const username = await validateGiteeToken(token);
      if (!username) {
        throw new Error('Gitee令牌验证失败');
      }

      // 存储令牌和用户名
      const store = getStore();
      store.set('gitee_token', token);
      store.set('gitee_username', username);

      return { success: true, username };
    } catch (error) {
      console.error('设置Gitee令牌失败:', error);
      throw error;
    }
  });

  // 检查认证状态
  ipcMain.handle('auth:checkStatus', (_event) => {
    try {
      const store = getStore();
      return {
        github: {
          authenticated: Boolean(store.get('github_token')),
          username: store.get('github_username'),
        },
        gitee: {
          authenticated: Boolean(store.get('gitee_token')),
          username: store.get('gitee_username'),
        },
      };
    } catch (error) {
      console.error('检查认证状态失败:', error);
      throw error;
    }
  });

  // 清除认证信息
  ipcMain.handle('auth:clear', (_event) => {
    try {
      const store = getStore();
      store.delete('github_token');
      store.delete('github_username');
      store.delete('gitee_token');
      store.delete('gitee_username');
      return { success: true };
    } catch (error) {
      console.error('清除认证信息失败:', error);
      throw error;
    }
  });
} 