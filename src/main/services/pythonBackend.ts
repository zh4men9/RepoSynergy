/// <reference types="node" />
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { app } from 'electron';

// Python后端进程
let pythonProcess: ChildProcess | null = null;

// Python路径和后端端口
const PYTHON_PATH = join(app.getAppPath(), 'backend', 'venv', 'Scripts', 'python.exe');
const BACKEND_PORT = process.env.VITE_PYTHON_BACKEND_PORT || 5000;

/**
 * 启动Python后端服务
 */
export async function startPythonBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 启动Python进程
      pythonProcess = spawn(PYTHON_PATH, [
        join(app.getAppPath(), 'backend', 'main.py'),
        '--port',
        BACKEND_PORT.toString(),
      ]);

      // 处理标准输出
      pythonProcess.stdout?.on('data', (data: Buffer) => {
        console.log('Python后端输出:', data.toString());
        // 当看到服务器启动成功的消息时解析Promise
        if (data.toString().includes('Server started')) {
          resolve();
        }
      });

      // 处理标准错误
      pythonProcess.stderr?.on('data', (data: Buffer) => {
        console.error('Python后端错误:', data.toString());
      });

      // 处理进程退出
      pythonProcess.on('exit', (code: number | null) => {
        console.log('Python后端退出，退出码:', code);
        pythonProcess = null;
      });

      // 设置超时
      setTimeout(() => {
        reject(new Error('启动Python后端超时'));
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 停止Python后端服务
 */
export async function stopPythonBackend(): Promise<void> {
  return new Promise((resolve) => {
    if (pythonProcess) {
      pythonProcess.on('exit', () => {
        pythonProcess = null;
        resolve();
      });

      // Windows下使用taskkill确保子进程也被终止
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', pythonProcess.pid!.toString(), '/f', '/t']);
      } else {
        pythonProcess.kill();
      }
    } else {
      resolve();
    }
  });
} 