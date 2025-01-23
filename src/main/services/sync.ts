import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { join } from 'path';
import { app } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import store from '../store';

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
}

const syncStatus: Record<string, SyncStatus> = {};

/**
 * 获取仓库本地路径
 */
function getRepoPath(repoId: string): string {
  return join(app.getPath('userData'), 'repos', repoId);
}

/**
 * 开始同步仓库
 */
export async function startSync(repo: Repository): Promise<SyncResult> {
  try {
    syncStatus[repo.id] = { status: 'syncing', progress: 0 };
    
    const repoPath = getRepoPath(repo.id);
    const githubToken = store.get('auth.githubToken');
    const giteeToken = store.get('auth.giteeToken');
    
    // 确保令牌存在
    if (!githubToken || !giteeToken) {
      throw new Error('缺少访问令牌');
    }
    
    // 克隆或拉取GitHub仓库
    await execAsync(`git clone https://oauth2:${githubToken}@github.com/${repo.name}.git ${repoPath}`);
    syncStatus[repo.id].progress = 30;
    
    // 添加Gitee远程仓库
    await execAsync(`cd ${repoPath} && git remote add gitee https://oauth2:${giteeToken}@gitee.com/${repo.name}.git`);
    syncStatus[repo.id].progress = 60;
    
    // 推送到Gitee
    await execAsync(`cd ${repoPath} && git push gitee --all`);
    syncStatus[repo.id].progress = 100;
    
    syncStatus[repo.id] = {
      status: 'idle',
      lastSync: new Date().toISOString()
    };
    
    return {
      success: true,
      message: '同步成功',
      details: {
        added: 0, // TODO: 计算实际数量
        modified: 0,
        deleted: 0
      }
    };
  } catch (error) {
    syncStatus[repo.id] = {
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误'
    };
    throw error;
  }
}

/**
 * 停止同步仓库
 */
export async function stopSync(repoId: string): Promise<void> {
  // TODO: 实现停止同步逻辑
  syncStatus[repoId] = { status: 'idle' };
}

/**
 * 获取同步状态
 */
export function getSyncStatus(repoId: string): SyncStatus {
  return syncStatus[repoId] || { status: 'idle' };
} 