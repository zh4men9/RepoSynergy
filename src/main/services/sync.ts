import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { join } from 'path';
import { app } from 'electron';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { getStore } from './store';

const execAsync = promisify(exec);

export interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  progress?: number;
  lastSync?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    added: number;
    modified: number;
    deleted: number;
  };
  error?: string;
}

const syncStatus: Record<string, SyncStatus> = {};
const activeSyncs = new Map<string, boolean>();

/**
 * 获取仓库本地路径
 */
function getRepoPath(repoId: string): string {
  return join(app.getPath('userData'), 'repos', repoId);
}

/**
 * 开始同步仓库
 */
export async function startSync(repositoryId: string): Promise<SyncResult> {
  try {
    if (activeSyncs.get(repositoryId)) {
      return {
        success: false,
        message: '仓库正在同步中',
      };
    }

    const store = getStore();
    const repositories = store.get('repositories') || [];
    const repository = repositories.find(repo => repo.id === repositoryId);

    if (!repository) {
      return {
        success: false,
        message: '仓库不存在',
      };
    }

    activeSyncs.set(repositoryId, true);

    const repoPath = getRepoPath(repositoryId);
    const githubToken = store.get('github_token');
    const giteeToken = store.get('gitee_token');
    
    if (!githubToken || !giteeToken) {
      throw new Error('缺少访问令牌');
    }
    
    await execAsync(`git clone https://oauth2:${githubToken}@github.com/${repository.name}.git ${repoPath}`);
    syncStatus[repositoryId] = { status: 'syncing', progress: 30 };
    
    await execAsync(`cd ${repoPath} && git remote add gitee https://oauth2:${giteeToken}@gitee.com/${repository.name}.git`);
    syncStatus[repositoryId].progress = 60;
    
    await execAsync(`cd ${repoPath} && git push gitee --all`);
    syncStatus[repositoryId].progress = 100;
    
    syncStatus[repositoryId] = {
      status: 'idle',
      lastSync: new Date().toISOString()
    };

    const updatedRepository = {
      ...repository,
      lastSyncTime: new Date().toISOString(),
    };
    const index = repositories.findIndex(repo => repo.id === repositoryId);
    repositories[index] = updatedRepository;
    store.set('repositories', repositories);

    return {
      success: true,
      message: '同步成功',
      details: {
        added: 0,
        modified: 0,
        deleted: 0
      }
    };
  } catch (error) {
    console.error('同步失败:', error);
    syncStatus[repositoryId] = {
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return {
      success: false,
      message: '同步失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  } finally {
    activeSyncs.delete(repositoryId);
  }
}

/**
 * 停止同步仓库
 */
export async function stopSync(repositoryId: string): Promise<SyncResult> {
  try {
    if (!activeSyncs.get(repositoryId)) {
      return {
        success: false,
        message: '仓库未在同步中',
      };
    }

    // TODO: 实现停止同步逻辑
    syncStatus[repositoryId] = { status: 'idle' };

    activeSyncs.delete(repositoryId);
    return {
      success: true,
      message: '已停止同步',
    };
  } catch (error) {
    console.error('停止同步失败:', error);
    return {
      success: false,
      message: '停止同步失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取同步状态
 */
export function getSyncStatus(repositoryId: string): SyncStatus {
  return syncStatus[repositoryId] || { status: 'idle' };
}

/**
 * 设置同步间隔
 * @param minutes 间隔分钟数
 */
export async function setSyncInterval(minutes: number): Promise<void> {
  try {
    const store = getStore();
    store.set('settings.sync_interval', minutes);
  } catch (error) {
    console.error('设置同步间隔失败:', error);
    throw error;
  }
}

/**
 * 获取同步间隔
 * @returns 间隔分钟数
 */
export async function getSyncInterval(): Promise<number> {
  try {
    const store = getStore();
    return store.get('settings.sync_interval') || 30;
  } catch (error) {
    console.error('获取同步间隔失败:', error);
    throw error;
  }
} 