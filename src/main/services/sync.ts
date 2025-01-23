import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { join } from 'path';
import { app } from 'electron';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { getStore, getGithubToken, getGiteeToken } from './store';
import type { SyncResult, SyncStatus } from '../../types/electron';

const execAsync = promisify(exec);

export interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

const syncStatus: Record<string, SyncStatus> = {};
const activeSyncs = new Map<string, boolean>();
const syncTasks = new Map<string, { process: any; status: string }>();

/**
 * 获取仓库本地路径
 */
function getRepoPath(repoId: string): string {
  return join(app.getPath('userData'), 'repos', repoId);
}

/**
 * 开始同步仓库
 */
export async function startSync(repoId: string): Promise<SyncResult> {
  if (syncTasks.has(repoId)) {
    return {
      success: false,
      message: '同步任务已在运行',
      error: 'SYNC_ALREADY_RUNNING',
    };
  }

  const githubToken = getGithubToken();
  const giteeToken = getGiteeToken();

  if (!githubToken || !giteeToken) {
    return {
      success: false,
      message: '请先设置 GitHub 和 Gitee 令牌',
      error: 'TOKENS_NOT_SET',
    };
  }

  try {
    // TODO: 实现实际的同步逻辑
    // 这里只是一个示例
    syncTasks.set(repoId, {
      process: null,
      status: 'syncing',
    });

    return {
      success: true,
      message: '同步已开始',
    };
  } catch (error) {
    return {
      success: false,
      message: '启动同步失败',
      error: (error as Error).message,
    };
  }
}

/**
 * 停止同步仓库
 */
export async function stopSync(repoId: string): Promise<SyncResult> {
  const task = syncTasks.get(repoId);
  if (!task) {
    return {
      success: false,
      message: '没有找到正在运行的同步任务',
      error: 'NO_SYNC_TASK',
    };
  }

  try {
    if (task.process) {
      // TODO: 实现停止同步的逻辑
      task.process.kill();
    }
    syncTasks.delete(repoId);

    return {
      success: true,
      message: '同步已停止',
    };
  } catch (error) {
    return {
      success: false,
      message: '停止同步失败',
      error: (error as Error).message,
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
  const store = getStore();
  store.set('settings.sync_interval', minutes);
}

/**
 * 获取同步间隔
 * @returns 间隔分钟数
 */
export async function getSyncInterval(): Promise<number> {
  const store = getStore();
  return store.get('settings.sync_interval') ?? 30;
} 