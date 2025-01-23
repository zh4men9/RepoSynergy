import { Octokit } from '@octokit/rest';
import axios from 'axios';

/**
 * 验证结果接口
 */
interface ValidationResult {
  valid: boolean;
  username?: string;
  error?: string;
}

/**
 * 验证GitHub令牌
 * @param token GitHub访问令牌
 * @returns 验证结果，包含用户名（如果验证成功）
 */
export async function validateGithubToken(token: string): Promise<string | null> {
  try {
    const octokit = new Octokit({
      auth: token,
    });

    // 获取认证用户信息
    const { data } = await octokit.users.getAuthenticated();
    return data.login;
  } catch (error) {
    console.error('GitHub令牌验证失败:', error);
    return null;
  }
}

/**
 * 验证Gitee令牌
 * @param token Gitee访问令牌
 * @returns 验证结果，包含用户名（如果验证成功）
 */
export async function validateGiteeToken(token: string): Promise<string | null> {
  try {
    const response = await axios.get('https://gitee.com/api/v5/user', {
      headers: {
        'Authorization': `token ${token}`,
      },
    });

    if (response.status === 200 && response.data.login) {
      return response.data.login;
    }
    return null;
  } catch (error) {
    console.error('Gitee令牌验证失败:', error);
    return null;
  }
} 