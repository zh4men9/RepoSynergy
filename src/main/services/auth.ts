import axios from 'axios';

/**
 * 验证结果接口
 */
interface ValidationResult {
  valid: boolean;
  username?: string;
  error?: string;
}

interface AuthResponse {
  username: string;
}

/**
 * 验证GitHub令牌
 * @param token GitHub访问令牌
 * @returns 验证结果，包含用户名（如果验证成功）
 */
export async function validateGithubToken(token: string): Promise<AuthResponse> {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return {
      username: response.data.login,
    };
  } catch (error) {
    throw new Error('GitHub 令牌验证失败');
  }
}

/**
 * 验证Gitee令牌
 * @param token Gitee访问令牌
 * @returns 验证结果，包含用户名（如果验证成功）
 */
export async function validateGiteeToken(token: string): Promise<AuthResponse> {
  try {
    const response = await axios.get('https://gitee.com/api/v5/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    return {
      username: response.data.login,
    };
  } catch (error) {
    throw new Error('Gitee 令牌验证失败');
  }
} 