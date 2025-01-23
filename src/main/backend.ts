import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { app } from 'electron';

let pythonProcess: ChildProcess | null = null;
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;

/**
 * 启动Python后端服务
 */
export async function startPythonBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 获取后端脚本路径
      const scriptPath = join(app.getAppPath(), 'backend', 'main.py');
      
      // 启动Python进程
      pythonProcess = spawn(PYTHON_PATH, [
        scriptPath,
        '--port', BACKEND_PORT.toString()
      ]);
      
      // 处理标准输出
      pythonProcess.stdout?.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        console.log('Python后端:', message);
        
        // 当服务器准备就绪时解析Promise
        if (message.includes('Server started')) {
          resolve();
        }
      });
      
      // 处理标准错误
      pythonProcess.stderr?.on('data', (data: Buffer) => {
        console.error('Python后端错误:', data.toString());
      });
      
      // 处理进程退出
      pythonProcess.on('close', (code: number) => {
        console.log(`Python后端进程退出，退出码: ${code}`);
        pythonProcess = null;
      });
      
      // 设置超时
      setTimeout(() => {
        if (pythonProcess) {
          reject(new Error('启动Python后端超时'));
        }
      }, 10000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 停止Python后端服务
 */
export function stopPythonBackend(): void {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// 在应用退出时确保Python进程被终止
app.on('will-quit', () => {
  stopPythonBackend();
}); 