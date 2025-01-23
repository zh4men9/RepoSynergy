import { join } from 'path';
import { readFile } from 'fs/promises';
import { app } from 'electron';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { getStore } from './store';

/**
 * 仓库统计信息接口
 */
interface RepositoryStats {
  commits: number;
  branches: number;
  tags: number;
  contributors: number;
  size: number;
  lastCommit: string;
}

/**
 * 语言统计信息接口
 */
interface LanguageStats {
  [language: string]: {
    files: number;
    lines: number;
    percentage: number;
  };
}

/**
 * 贡献统计信息接口
 */
interface ContributionStats {
  [author: string]: {
    commits: number;
    additions: number;
    deletions: number;
    percentage: number;
  };
}

/**
 * 依赖统计信息接口
 */
interface DependencyStats {
  direct: {
    [name: string]: string;
  };
  dev: {
    [name: string]: string;
  };
  outdated: {
    [name: string]: {
      current: string;
      latest: string;
      type: 'major' | 'minor' | 'patch';
    };
  };
}

/**
 * 获取仓库统计信息
 * @param repositoryId 仓库ID
 * @returns 仓库统计信息
 */
export async function getRepositoryStats(repositoryId: string): Promise<RepositoryStats> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const repository = repositories.find(repo => repo.id === repositoryId);

    if (!repository) {
      throw new Error('仓库不存在');
    }

    const repoPath = join(app.getPath('userData'), 'repositories', repositoryId);

    // 执行Git命令获取统计信息
    const [commits, branches, tags, contributors, size, lastCommit] = await Promise.all([
      executeGitCommand(repoPath, 'rev-list --count HEAD'),
      executeGitCommand(repoPath, 'branch --list | wc -l'),
      executeGitCommand(repoPath, 'tag --list | wc -l'),
      executeGitCommand(repoPath, 'shortlog -s HEAD | wc -l'),
      executeGitCommand(repoPath, 'count-objects -v | grep size-pack | cut -d: -f2'),
      executeGitCommand(repoPath, 'log -1 --format=%cd'),
    ]);

    return {
      commits: parseInt(commits, 10),
      branches: parseInt(branches, 10),
      tags: parseInt(tags, 10),
      contributors: parseInt(contributors, 10),
      size: parseInt(size, 10) * 1024, // 转换为字节
      lastCommit,
    };
  } catch (error) {
    console.error('获取仓库统计信息失败:', error);
    throw error;
  }
}

/**
 * 获取语言统计信息
 * @param repositoryId 仓库ID
 * @returns 语言统计信息
 */
export async function getLanguageStats(repositoryId: string): Promise<LanguageStats> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const repository = repositories.find(repo => repo.id === repositoryId);

    if (!repository) {
      throw new Error('仓库不存在');
    }

    const repoPath = join(app.getPath('userData'), 'repositories', repositoryId);

    // 使用cloc命令获取语言统计
    const result = await executeCommand('cloc', ['--json', repoPath]);
    const stats = JSON.parse(result);

    // 转换为所需格式
    const totalLines = Object.values(stats).reduce((acc: number, lang: any) => acc + lang.code, 0);
    const languages: LanguageStats = {};

    for (const [language, data] of Object.entries(stats)) {
      if (language !== 'header' && language !== 'SUM') {
        const langData = data as any;
        languages[language] = {
          files: langData.nFiles,
          lines: langData.code,
          percentage: (langData.code / totalLines) * 100,
        };
      }
    }

    return languages;
  } catch (error) {
    console.error('获取语言统计信息失败:', error);
    throw error;
  }
}

/**
 * 获取贡献统计信息
 * @param repositoryId 仓库ID
 * @returns 贡献统计信息
 */
export async function getContributionStats(repositoryId: string): Promise<ContributionStats> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const repository = repositories.find(repo => repo.id === repositoryId);

    if (!repository) {
      throw new Error('仓库不存在');
    }

    const repoPath = join(app.getPath('userData'), 'repositories', repositoryId);

    // 获取贡献统计
    const result = await executeGitCommand(
      repoPath,
      'log --format="%aN" --numstat | awk \'{ if (NF == 3) { a[$1] += $1; d[$1] += $2 } else if (NF == 1) { name=$1 } } END { for (i in a) print i "," a[i] "," d[i] }\''
    );

    const stats: ContributionStats = {};
    const lines = result.split('\n').filter(Boolean);
    let totalCommits = 0;

    for (const line of lines) {
      const [author, additions, deletions] = line.split(',');
      totalCommits += parseInt(additions, 10) + parseInt(deletions, 10);
      stats[author] = {
        commits: await getAuthorCommitCount(repoPath, author),
        additions: parseInt(additions, 10),
        deletions: parseInt(deletions, 10),
        percentage: 0, // 稍后计算
      };
    }

    // 计算百分比
    for (const author in stats) {
      const total = stats[author].additions + stats[author].deletions;
      stats[author].percentage = (total / totalCommits) * 100;
    }

    return stats;
  } catch (error) {
    console.error('获取贡献统计信息失败:', error);
    throw error;
  }
}

/**
 * 获取依赖统计信息
 * @param repositoryId 仓库ID
 * @returns 依赖统计信息
 */
export async function getDependencyStats(repositoryId: string): Promise<DependencyStats> {
  try {
    const store = getStore();
    const repositories = store.get('repositories') || [];
    const repository = repositories.find(repo => repo.id === repositoryId);

    if (!repository) {
      throw new Error('仓库不存在');
    }

    const repoPath = join(app.getPath('userData'), 'repositories', repositoryId);
    const packageJsonPath = join(repoPath, 'package.json');

    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      const outdatedResult = await executeCommand('npm', ['outdated', '--json'], { cwd: repoPath });
      const outdated = JSON.parse(outdatedResult);

      return {
        direct: packageJson.dependencies || {},
        dev: packageJson.devDependencies || {},
        outdated: Object.entries(outdated).reduce((acc: any, [name, info]: [string, any]) => {
          acc[name] = {
            current: info.current,
            latest: info.latest,
            type: getVersionDiffType(info.current, info.latest),
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      // 如果不是Node.js项目，返回空统计信息
      return {
        direct: {},
        dev: {},
        outdated: {},
      };
    }
  } catch (error) {
    console.error('获取依赖统计信息失败:', error);
    throw error;
  }
}

/**
 * 执行Git命令
 * @param repoPath 仓库路径
 * @param command Git命令
 * @returns 命令输出
 */
async function executeGitCommand(repoPath: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn('git', ['-C', repoPath, ...command.split(' ')]);
    let output = '';
    let error = '';

    process.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    process.stderr.on('data', (data: Buffer) => {
      error += data.toString();
    });

    process.on('close', (code: number) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(error.trim() || `Git命令执行失败，退出码: ${code}`));
      }
    });
  });
}

/**
 * 执行命令
 * @param command 命令
 * @param args 参数
 * @param options 选项
 * @returns 命令输出
 */
async function executeCommand(
  command: string,
  args: string[],
  options: { cwd?: string } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);
    let output = '';
    let error = '';

    process.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    process.stderr.on('data', (data: Buffer) => {
      error += data.toString();
    });

    process.on('close', (code: number) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(error.trim() || `命令执行失败，退出码: ${code}`));
      }
    });
  });
}

/**
 * 获取作者提交次数
 * @param repoPath 仓库路径
 * @param author 作者
 * @returns 提交次数
 */
async function getAuthorCommitCount(repoPath: string, author: string): Promise<number> {
  const count = await executeGitCommand(
    repoPath,
    `log --author="${author}" --oneline | wc -l`
  );
  return parseInt(count, 10);
}

/**
 * 获取版本差异类型
 * @param current 当前版本
 * @param latest 最新版本
 * @returns 差异类型
 */
function getVersionDiffType(current: string, latest: string): 'major' | 'minor' | 'patch' {
  const [currentMajor, currentMinor] = current.split('.').map(Number);
  const [latestMajor, latestMinor] = latest.split('.').map(Number);

  if (latestMajor > currentMajor) return 'major';
  if (latestMinor > currentMinor) return 'minor';
  return 'patch';
} 