import { Octokit } from '@octokit/rest';
import axios from 'axios';

interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

/**
 * 获取GitHub仓库列表
 * @param token GitHub访问令牌
 * @returns 仓库列表
 */
export async function fetchGithubRepositories(token: string): Promise<Repository[]> {
  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100
    });

    return data.map(repo => ({
      id: `gh_${repo.id}`,
      name: repo.full_name,
      platform: 'github',
      syncEnabled: false
    }));
  } catch (error) {
    console.error('获取GitHub仓库列表失败:', error);
    throw new Error('获取GitHub仓库列表失败');
  }
}

/**
 * 获取Gitee仓库列表
 * @param token Gitee访问令牌
 * @returns 仓库列表
 */
export async function fetchGiteeRepositories(token: string): Promise<Repository[]> {
  try {
    const response = await axios.get('https://gitee.com/api/v5/user/repos', {
      headers: {
        'Authorization': `token ${token}`
      },
      params: {
        access_token: token,
        type: 'all',
        sort: 'updated',
        per_page: 100
      }
    });

    return response.data.map((repo: any) => ({
      id: `gt_${repo.id}`,
      name: repo.full_name,
      platform: 'gitee',
      syncEnabled: false
    }));
  } catch (error) {
    console.error('获取Gitee仓库列表失败:', error);
    throw new Error('获取Gitee仓库列表失败');
  }
}

/**
 * 添加仓库到同步列表
 * @param repository 仓库信息
 */
export async function addRepository(repository: Repository): Promise<void> {
  // TODO: 实现仓库添加逻辑
  // 例如：克隆仓库、设置远程等
}

/**
 * 从同步列表移除仓库
 * @param id 仓库ID
 */
export async function removeRepository(id: string): Promise<void> {
  // TODO: 实现仓库移除逻辑
  // 例如：清理本地文件等
}

/**
 * 更新仓库信息
 * @param repository 仓库信息
 */
export async function updateRepository(repository: Repository): Promise<void> {
  // TODO: 实现仓库更新逻辑
  // 例如：更新同步设置等
} 