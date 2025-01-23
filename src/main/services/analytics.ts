import { join } from 'path';
import { readFile, readdir } from 'fs/promises';
import { app } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RepositoryStats {
  commits: number;
  branches: number;
  contributors: number;
  pullRequests: number;
  issues: number;
  lastActivity: string;
}

export interface LanguageStats {
  [language: string]: {
    lines: number;
    percentage: number;
    files: number;
  };
}

export interface ContributionStats {
  [author: string]: {
    commits: number;
    additions: number;
    deletions: number;
    lastCommit: string;
  };
}

export interface DependencyStats {
  direct: number;
  indirect: number;
  outdated: number;
  vulnerable: number;
  dependencies: Array<{
    name: string;
    currentVersion: string;
    latestVersion: string;
    type: 'direct' | 'indirect';
    isOutdated: boolean;
    isVulnerable: boolean;
  }>;
}

/**
 * 获取仓库本地路径
 */
function getRepoPath(repoId: string): string {
  return join(app.getPath('userData'), 'repos', repoId);
}

/**
 * 获取仓库统计信息
 */
export async function getRepositoryStats(repoId: string): Promise<RepositoryStats> {
  const repoPath = getRepoPath(repoId);
  
  try {
    // 获取提交数量
    const { stdout: commitCount } = await execAsync('git rev-list --count HEAD', { cwd: repoPath });
    
    // 获取分支数量
    const { stdout: branchList } = await execAsync('git branch -a', { cwd: repoPath });
    const branches = branchList.split('\n').filter(Boolean).length;
    
    // 获取贡献者数量
    const { stdout: contributorList } = await execAsync('git shortlog -sn --all', { cwd: repoPath });
    const contributors = contributorList.split('\n').filter(Boolean).length;
    
    // 获取最后活动时间
    const { stdout: lastCommitDate } = await execAsync('git log -1 --format=%cd', { cwd: repoPath });
    
    return {
      commits: parseInt(commitCount.trim(), 10),
      branches,
      contributors,
      pullRequests: 0, // TODO: 从API获取
      issues: 0, // TODO: 从API获取
      lastActivity: new Date(lastCommitDate.trim()).toISOString()
    };
  } catch (error) {
    console.error('获取仓库统计信息失败:', error);
    throw new Error('获取仓库统计信息失败');
  }
}

/**
 * 获取语言统计信息
 */
export async function getLanguageStats(repoId: string): Promise<LanguageStats> {
  const repoPath = getRepoPath(repoId);
  const stats: LanguageStats = {};
  
  try {
    // 使用git ls-files获取所有文件
    const { stdout: fileList } = await execAsync('git ls-files', { cwd: repoPath });
    const files = fileList.split('\n').filter(Boolean);
    
    let totalLines = 0;
    
    // 统计每种语言的行数
    for (const file of files) {
      const ext = file.split('.').pop()?.toLowerCase() || 'unknown';
      const filePath = join(repoPath, file);
      
      try {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n').length;
        
        if (!stats[ext]) {
          stats[ext] = { lines: 0, percentage: 0, files: 0 };
        }
        
        stats[ext].lines += lines;
        stats[ext].files += 1;
        totalLines += lines;
      } catch (error) {
        console.warn(`无法读取文件 ${file}:`, error);
      }
    }
    
    // 计算百分比
    for (const lang in stats) {
      stats[lang].percentage = (stats[lang].lines / totalLines) * 100;
    }
    
    return stats;
  } catch (error) {
    console.error('获取语言统计信息失败:', error);
    throw new Error('获取语言统计信息失败');
  }
}

/**
 * 获取贡献统计信息
 */
export async function getContributionStats(repoId: string): Promise<ContributionStats> {
  const repoPath = getRepoPath(repoId);
  const stats: ContributionStats = {};
  
  try {
    // 获取所有提交信息
    const { stdout } = await execAsync(
      'git log --pretty=format:"%an|%ad|%H" --numstat',
      { cwd: repoPath }
    );
    
    const commits = stdout.split('\n\n');
    
    for (const commit of commits) {
      const lines = commit.split('\n');
      const [author, date, hash] = lines[0].split('|');
      
      if (!stats[author]) {
        stats[author] = {
          commits: 0,
          additions: 0,
          deletions: 0,
          lastCommit: new Date(date).toISOString()
        };
      }
      
      stats[author].commits += 1;
      
      // 统计更改行数
      for (let i = 1; i < lines.length; i++) {
        const [add, del] = lines[i].split('\t').map(Number);
        if (!isNaN(add) && !isNaN(del)) {
          stats[author].additions += add;
          stats[author].deletions += del;
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('获取贡献统计信息失败:', error);
    throw new Error('获取贡献统计信息失败');
  }
}

/**
 * 获取依赖统计信息
 */
export async function getDependencyStats(repoId: string): Promise<DependencyStats> {
  const repoPath = getRepoPath(repoId);
  
  try {
    const packageJsonPath = join(repoPath, 'package.json');
    const packageLockPath = join(repoPath, 'package-lock.json');
    
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    const packageLock = JSON.parse(await readFile(packageLockPath, 'utf-8'));
    
    const dependencies = [];
    let direct = 0;
    let indirect = 0;
    let outdated = 0;
    let vulnerable = 0;
    
    // 分析直接依赖
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      const dep = {
        name,
        currentVersion: version as string,
        latestVersion: '', // TODO: 从npm registry获取
        type: 'direct' as const,
        isOutdated: false,
        isVulnerable: false // TODO: 从安全数据库获取
      };
      
      dependencies.push(dep);
      direct += 1;
    }
    
    // TODO: 分析间接依赖
    
    return {
      direct,
      indirect,
      outdated,
      vulnerable,
      dependencies
    };
  } catch (error) {
    console.error('获取依赖统计信息失败:', error);
    throw new Error('获取依赖统计信息失败');
  }
} 