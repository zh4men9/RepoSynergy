import { Octokit } from '@octokit/rest';
import axios from 'axios';

interface ValidationResult {
  isValid: boolean;
  username?: string;
  error?: string;
}

/**
 * 验证GitHub令牌
 * @param token GitHub访问令牌
 * @returns 验证结果
 */
export async function validateGithubToken(token: string): Promise<ValidationResult> {
  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    
    return {
      isValid: true,
      username: data.login
    };
  } catch (error) {
    console.error('GitHub令牌验证失败:', error);
    return {
      isValid: false,
      error: '无效的GitHub令牌'
    };
  }
}

/**
 * 验证Gitee令牌
 * @param token Gitee访问令牌
 * @returns 验证结果
 */
export async function validateGiteeToken(token: string): Promise<ValidationResult> {
  try {
    const response = await axios.get('https://gitee.com/api/v5/user', {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    
    return {
      isValid: true,
      username: response.data.login
    };
  } catch (error) {
    console.error('Gitee令牌验证失败:', error);
    return {
      isValid: false,
      error: '无效的Gitee令牌'
    };
  }
} 