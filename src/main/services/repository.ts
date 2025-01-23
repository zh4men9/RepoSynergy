import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { getStore, getGithubToken, getGiteeToken } from './store';
import type { Repository } from '../../types/electron';

/**
 * 仓库接口
 */
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
export async function fetchGithubRepos(token: string): Promise<Repository[]> {
  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data } = await octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100,
    });

    return data.map(repo => ({
      id: `github_${repo.id}`,
      name: repo.full_name,
      platform: 'github',
      syncEnabled: false,
    }));
  } catch (error) {
    console.error('获取GitHub仓库列表失败:', error);
    throw error;
  }
}

/**
 * 获取Gitee仓库列表
 * @param token Gitee访问令牌
 * @returns 仓库列表
 */
export async function fetchGiteeRepos(token: string): Promise<Repository[]> {
  try {
    const response = await axios.get('https://gitee.com/api/v5/user/repos', {
      headers: {
        'Authorization': `token ${token}`,
      },
      params: {
        access_token: token,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      },
    });

    return response.data.map((repo: any) => ({
      id: `gitee_${repo.id}`,
      name: repo.full_name,
      platform: 'gitee',
      syncEnabled: false,
    }));
  } catch (error) {
    console.error('获取Gitee仓库列表失败:', error);
    throw error;
  }
}

/**
 * 添加仓库到同步列表
 * @param repository 要添加的仓库信息
 * @returns 添加后的仓库信息
 */
export async function addRepository(repository: Repository): Promise<Repository> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    
    // 检查是否已存在
    if (repositories.some((repo: Repository) => repo.id === repository.id)) {
      throw new Error('仓库已存在于同步列表中');
    }

    // 添加到列表
    const newRepository = {
      ...repository,
      syncEnabled: true,
      lastSyncTime: new Date().toISOString(),
    };
    repositories.push(newRepository);
    store.set('repositories', repositories);

    return newRepository;
  } catch (error) {
    console.error('添加仓库失败:', error);
    throw error;
  }
}

/**
 * 从同步列表移除仓库
 * @param id 仓库ID
 * @returns 是否成功移除
 */
export async function removeRepository(id: string): Promise<boolean> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const newRepositories = repositories.filter((repo: Repository) => repo.id !== id);
    store.set('repositories', newRepositories);
    return true;
  } catch (error) {
    console.error('移除仓库失败:', error);
    throw error;
  }
}

/**
 * 更新仓库信息
 * @param id 仓库ID
 * @param updates 要更新的字段
 * @returns 更新后的仓库信息
 */
export async function updateRepository(id: string, updates: Partial<Repository>): Promise<Repository> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const index = repositories.findIndex((repo: Repository) => repo.id === id);

    if (index === -1) {
      throw new Error('仓库不存在');
    }

    const updatedRepository = {
      ...repositories[index],
      ...updates,
      lastSyncTime: new Date().toISOString(),
    };

    repositories[index] = updatedRepository;
    store.set('repositories', repositories);

    return updatedRepository;
  } catch (error) {
    console.error('更新仓库失败:', error);
    throw error;
  }
}

/**
 * 获取同步列表
 * @returns 同步列表中的仓库
 */
export async function getSyncList(): Promise<Repository[]> {
  try {
    const store = getStore();
    return store.get('repositories') || [];
  } catch (error) {
    console.error('获取同步列表失败:', error);
    throw error;
  }
}

export async function getGithubRepos(): Promise<Repository[]> {
  const token = getGithubToken();
  if (!token) {
    throw new Error('GitHub 令牌未设置');
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      },
    });

    return response.data.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      platform: 'github',
      syncEnabled: false,
      lastSyncTime: undefined,
    }));
  } catch (error) {
    throw new Error('获取 GitHub 仓库列表失败');
  }
}

export async function getGiteeRepos(): Promise<Repository[]> {
  const token = getGiteeToken();
  if (!token) {
    throw new Error('Gitee 令牌未设置');
  }

  try {
    const response = await axios.get('https://gitee.com/api/v5/user/repos', {
      headers: {
        Authorization: `token ${token}`,
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      },
    });

    return response.data.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      platform: 'gitee',
      syncEnabled: false,
      lastSyncTime: undefined,
    }));
  } catch (error) {
    throw new Error('获取 Gitee 仓库列表失败');
  }
} 