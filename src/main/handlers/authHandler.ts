import { ipcMain } from 'electron';
import { setGithubToken, setGiteeToken, clearTokens } from '../services/store';
import { validateGithubToken, validateGiteeToken } from '../services/auth';

/**
 * 注册认证相关的IPC处理程序
 */
export function setupAuthHandlers(): void {
  // 设置GitHub令牌
  ipcMain.handle('auth:setGithubToken', async (_, token: string) => {
    try {
      const { username } = await validateGithubToken(token);
      setGithubToken(token);
      return { success: true, username };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // 设置Gitee令牌
  ipcMain.handle('auth:setGiteeToken', async (_, token: string) => {
    try {
      const { username } = await validateGiteeToken(token);
      setGiteeToken(token);
      return { success: true, username };
    } catch (error) {
      return { success: false, error: (error as Error).message };
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
  ipcMain.handle('auth:clear', async () => {
    try {
      clearTokens();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
} 