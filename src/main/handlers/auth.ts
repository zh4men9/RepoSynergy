import { ipcMain } from 'electron';
import store from '../store';
import { encrypt } from '../utils/crypto';
import { validateGithubToken, validateGiteeToken } from '../services/auth';

interface TokenValidationResult {
  isValid: boolean;
  username?: string;
  error?: string;
}

/**
 * 注册认证相关的IPC处理程序
 */
export function registerAuthHandlers(): void {
  // 设置GitHub令牌
  ipcMain.handle('auth:setGithubToken', async (_event, token: string): Promise<TokenValidationResult> => {
    try {
      // 验证令牌
      const validation = await validateGithubToken(token);
      if (validation.isValid) {
        // 加密并存储令牌
        store.set('auth.githubToken', token);
        return validation;
      }
      return { isValid: false, error: '无效的GitHub令牌' };
    } catch (error) {
      console.error('设置GitHub令牌失败:', error);
      return { isValid: false, error: '设置GitHub令牌失败' };
    }
  });

  // 设置Gitee令牌
  ipcMain.handle('auth:setGiteeToken', async (_event, token: string): Promise<TokenValidationResult> => {
    try {
      // 验证令牌
      const validation = await validateGiteeToken(token);
      if (validation.isValid) {
        // 加密并存储令牌
        store.set('auth.giteeToken', token);
        return validation;
      }
      return { isValid: false, error: '无效的Gitee令牌' };
    } catch (error) {
      console.error('设置Gitee令牌失败:', error);
      return { isValid: false, error: '设置Gitee令牌失败' };
    }
  });

  // 检查认证状态
  ipcMain.handle('auth:checkStatus', async (): Promise<{
    github: boolean;
    gitee: boolean;
  }> => {
    const githubToken = store.get('auth.githubToken');
    const giteeToken = store.get('auth.giteeToken');

    return {
      github: Boolean(githubToken),
      gitee: Boolean(giteeToken)
    };
  });

  // 清除认证信息
  ipcMain.handle('auth:clear', async (): Promise<void> => {
    store.delete('auth.githubToken');
    store.delete('auth.giteeToken');
  });
} 