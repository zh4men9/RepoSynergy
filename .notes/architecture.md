# 系统架构设计

## 项目结构
```
/
├── src/                    # 前端源码
│   ├── components/        # React组件
│   ├── pages/            # 页面组件
│   ├── hooks/            # 自定义Hooks
│   ├── store/            # Redux状态管理
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript类型
│   ├── assets/           # 静态资源
│   └── layouts/          # 布局组件
├── backend/               # 后端源码
│   ├── api/              # API路由
│   ├── core/             # 核心配置
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   ├── schemas/          # 数据验证
│   ├── utils/            # 工具函数
│   ├── tasks/            # 异步任务
│   ├── cache/            # 缓存策略
│   └── migrations/       # 数据库迁移
├── electron/              # Electron主进程
│   ├── main/             # 主进程代码
│   ├── preload/          # 预加载脚本
│   └── utils/            # 工具函数
├── shared/                # 共享代码
│   ├── constants/        # 常量定义
│   ├── types/            # 类型定义
│   └── utils/            # 共享工具
├── scripts/               # 构建脚本
│   ├── build/            # 构建配置
│   ├── deploy/           # 部署脚本
│   └── test/             # 测试脚本
├── config/                # 配置文件
│   ├── webpack/          # Webpack配置
│   ├── electron/         # Electron配置
│   └── jest/             # 测试配置
└── .notes/               # 项目文档
```

## 桌面应用架构

### Electron 架构
- **主进程 (Main Process)**
  - 应用生命周期管理
  - 系统托盘集成
  - 原生菜单管理
  - IPC 通信管理
  - 自动更新服务
  - 本地数据加密
  - 崩溃报告收集

- **渲染进程 (Renderer Process)**
  - React 应用
  - 本地存储管理
  - UI 渲染
  - 事件处理
  - 状态管理
  - 离线功能支持

### 性能优化
- **缓存策略**
  ```typescript
  interface CacheConfig {
    strategy: 'stale-while-revalidate' | 'cache-first';
    ttl: number;
    maxSize: number;
  }
  ```

- **预加载优化**
  ```typescript
  // preload.ts
  contextBridge.exposeInMainWorld('api', {
    cache: {
      get: (key: string) => ipcRenderer.invoke('cache:get', key),
      set: (key: string, value: any) => ipcRenderer.invoke('cache:set', key, value)
    }
  });
  ```

### 安全架构
- **数据加密**
  ```typescript
  interface EncryptionConfig {
    algorithm: 'AES-256-GCM';
    keyRotation: number; // days
    saltRounds: number;
  }
  ```

- **权限控制**
  ```typescript
  enum PermissionLevel {
    READ = 'read',
    WRITE = 'write',
    ADMIN = 'admin'
  }
  ```

## 前端架构

### 状态管理
```typescript
// store/index.ts
interface RootState {
  repos: RepoState;
  sync: SyncState;
  user: UserState;
  ui: UIState;
  cache: CacheState;
}
```

### 性能优化
- 组件代码分割
- 路由懒加载
- 虚拟列表
- 图片懒加载
- 状态本地持久化

## 后端架构

### 缓存层设计
```python
class CacheService:
    def __init__(self):
        self.local_cache = TTLCache(maxsize=100, ttl=3600)
        self.redis_cache = RedisCache()

    async def get_or_set(self, key: str, getter: Callable, ttl: int = 3600):
        if value := await self.get(key):
            return value
        value = await getter()
        await self.set(key, value, ttl)
        return value
```

### 任务队列
```python
class SyncQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.workers = []

    async def process_queue(self):
        while True:
            task = await self.queue.get()
            try:
                await self.process_task(task)
            finally:
                self.queue.task_done()
```

## 数据库设计

### 新增表结构
1. **缓存表 (cache_data)**
   - id: Integer, 主键
   - key: String, 缓存键
   - value: JSON, 缓存值
   - created_at: DateTime
   - expires_at: DateTime
   - type: String, 缓存类型

2. **配置表 (settings)**
   - id: Integer, 主键
   - user_id: Integer, 外键
   - key: String
   - value: JSON
   - updated_at: DateTime

3. **任务队列表 (sync_tasks)**
   - id: Integer, 主键
   - type: String, 任务类型
   - status: Enum('pending', 'running', 'completed', 'failed')
   - payload: JSON
   - priority: Integer
   - created_at: DateTime
   - started_at: DateTime
   - completed_at: DateTime

## 错误处理

### 错误恢复策略
```python
class ErrorRecoveryStrategy:
    def __init__(self):
        self.max_retries = 3
        self.backoff_factor = 2

    async def execute_with_retry(self, func: Callable, *args, **kwargs):
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise
                await self.handle_error(e, attempt)
                await asyncio.sleep(self.backoff_factor ** attempt)
```

## 监控系统

### 性能监控
```typescript
interface PerformanceMetrics {
  apiLatency: Record<string, number>;
  componentRenderTime: Record<string, number>;
  memoryUsage: number;
  cpuUsage: number;
}
```

### 健康检查
```python
class HealthCheck:
    async def check_database(self):
        try:
            await db.execute("SELECT 1")
            return True
        except Exception:
            return False

    async def check_github_api(self):
        try:
            await github_client.get_rate_limit()
            return True
        except Exception:
            return False
```

## 桌面应用架构

### Electron 架构
- **主进程 (Main Process)**
  - 应用生命周期管理
  - 系统托盘集成
  - 原生菜单管理
  - IPC 通信管理
  - 自动更新服务

- **渲染进程 (Renderer Process)**
  - React 应用
  - 本地存储管理
  - UI 渲染
  - 事件处理

### IPC 通信
```typescript
// IPC 通道定义
enum IpcChannels {
  SYNC_REPO = 'sync-repo',
  GET_REPO_STATUS = 'get-repo-status',
  NOTIFY_SYNC_COMPLETE = 'notify-sync-complete',
  SHOW_CONFIRMATION = 'show-confirmation'
}
```

## 前端架构

### 技术选型
- React 18 + TypeScript
- Ant Design 组件库
- Redux Toolkit 状态管理
- React Router 路由管理
- ECharts 图表可视化

### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── repository/     # 仓库相关组件
│   ├── analysis/       # 数据分析组件
│   └── sync/          # 同步相关组件
├── pages/              # 页面组件
├── store/              # Redux 状态管理
│   ├── slices/        # Redux切片
│   └── middleware/    # Redux中间件
├── services/           # API 服务
│   ├── github/        # GitHub API封装
│   ├── gitee/         # Gitee API封装
│   └── local/         # 本地API封装
├── utils/              # 工具函数
└── types/              # TypeScript 类型定义
```

## 后端架构

### 技术选型
- FastAPI
- SQLAlchemy ORM
- PyGithub & Gitee SDK
- JWT 认证
- APScheduler 任务调度
- SMTPLib 邮件服务

### 目录结构
```
backend/
├── api/                # API 路由
│   ├── auth/          # 认证相关
│   ├── repos/         # 仓库管理
│   ├── sync/          # 同步服务
│   └── analysis/      # 数据分析
├── core/               # 核心配置
│   ├── config.py      # 配置管理
│   ├── security.py    # 安全相关
│   └── scheduler.py   # 任务调度
├── models/             # 数据模型
├── services/           # 业务逻辑
│   ├── github_service.py
│   ├── gitee_service.py
│   ├── sync_service.py
│   ├── analysis_service.py
│   └── notification_service.py
├── schemas/            # 数据验证
└── utils/              # 工具函数
```

## 数据库设计

### 表结构
1. **用户表 (users)**
   - id: Integer, 主键
   - username: String, 用户名
   - email: String, 邮箱
   - github_token: String, GitHub Token (加密存储)
   - gitee_token: String, Gitee Token (加密存储)
   - notification_settings: JSON, 通知设置

2. **仓库表 (repositories)**
   - id: Integer, 主键
   - platform: Enum('github', 'gitee'), 平台
   - repo_name: String, 仓库名
   - owner: String, 所有者
   - sync_enabled: Boolean, 是否启用同步
   - sync_settings: JSON, 同步设置
   - last_sync_time: DateTime, 最后同步时间
   - sync_status: Enum('idle', 'syncing', 'failed', 'success')

3. **同步记录表 (sync_logs)**
   - id: Integer, 主键
   - repo_id: Integer, 外键关联repositories
   - direction: Enum('github_to_gitee', 'gitee_to_github')
   - status: Enum('success', 'failed')
   - start_time: DateTime
   - end_time: DateTime
   - error_message: Text
   - sync_details: JSON

4. **操作历史表 (operation_logs)**
   - id: Integer, 主键
   - user_id: Integer, 外键关联users
   - operation_type: String
   - target_type: String
   - target_id: Integer
   - operation_time: DateTime
   - operation_details: JSON
   - status: Enum('success', 'failed')

5. **统计数据表 (repo_stats)**
   - id: Integer, 主键
   - repo_id: Integer, 外键关联repositories
   - stats_time: DateTime
   - stars_count: Integer
   - forks_count: Integer
   - views_count: Integer
   - contributors_count: Integer
   - language_stats: JSON
   - activity_data: JSON

## API 设计

### 认证相关
- POST /api/auth/github/login
- POST /api/auth/gitee/login
- POST /api/auth/refresh-token

### 仓库管理
- GET /api/repos
- GET /api/repos/{id}
- DELETE /api/repos/{id}
- PATCH /api/repos/{id}
- POST /api/repos/batch-delete

### 同步功能
- POST /api/sync/repo/{id}
- POST /api/sync/batch
- GET /api/sync/status/{id}
- POST /api/sync/retry/{id}
- GET /api/sync/history/{repo_id}

### 数据分析
- GET /api/analysis/repo/{id}/overview
- GET /api/analysis/repo/{id}/languages
- GET /api/analysis/repo/{id}/activity
- GET /api/analysis/repo/{id}/contributors

### 系统配置
- GET /api/config/notification
- PUT /api/config/notification
- GET /api/config/sync-settings
- PUT /api/config/sync-settings

## 通知系统设计

### 邮件通知
```python
class NotificationConfig:
    SMTP_SERVER: str
    SMTP_PORT: int
    SENDER_EMAIL: str
    TEMPLATES_DIR: str

class NotificationEvents(Enum):
    SYNC_COMPLETE = "sync_complete"
    SYNC_FAILED = "sync_failed"
    BATCH_OPERATION_COMPLETE = "batch_operation_complete"
    SECURITY_ALERT = "security_alert"
```

### 通知模板
- sync_complete.html
- sync_failed.html
- batch_operation_complete.html
- security_alert.html

## 安全设计

### 认证机制
- OAuth2.0 认证流程
- JWT Token 验证
- Token 自动刷新机制
- 敏感操作二次确认

### 数据安全
- Token 加密存储
- HTTPS 传输
- 本地数据加密
- 访问权限控制

### 操作审计
- 敏感操作日志
- 操作历史追踪
- 异常操作告警

## 错误处理

### 错误码设计
```python
class ErrorCodes(Enum):
    AUTH_FAILED = (1001, "认证失败")
    TOKEN_EXPIRED = (1002, "Token已过期")
    SYNC_FAILED = (2001, "同步失败")
    RATE_LIMIT = (2002, "API调用频率限制")
    NETWORK_ERROR = (3001, "网络错误")
    DATABASE_ERROR = (4001, "数据库错误")
```

### 错误处理流程
1. 错误捕获
2. 错误日志记录
3. 错误通知
4. 错误恢复 