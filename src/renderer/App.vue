<template>
  <el-config-provider namespace="ep">
    <div class="app">
      <el-container>
        <el-aside width="200px">
          <el-menu
            :router="true"
            :default-active="$route.path"
            class="menu"
          >
            <el-menu-item index="/">
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/repositories">
              <span>仓库管理</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <span>设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header height="60px">
            <div class="header">
              <h1>RepoSynergy</h1>
              <div class="user-info">
                <!-- TODO: 添加用户信息和登出按钮 -->
              </div>
            </div>
          </el-header>
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
// 移除不需要的图标导入
</script>

<style>
/* 重置 Element Plus 的默认样式 */
:root {
  --el-button-size: 32px;
  --el-font-size-base: 14px;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.menu {
  height: 100%;
  border-right: none;
  background-color: transparent;
}

.el-menu-item {
  color: #bfcbd9;
  height: 45px;
  line-height: 45px;
}

.el-menu-item .el-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.el-menu-item span {
  font-size: 14px;
}

.el-menu-item.is-active {
  color: #409eff;
  background-color: #263445;
}

.el-menu-item:hover {
  background-color: #263445;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.nav {
  background: var(--color-bg-secondary);
  padding: 1rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.main {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg-primary);
}

/* 重置按钮样式 */
button {
  font: inherit;
  font-size: var(--text-sm);
}

.el-button {
  height: auto;
  --el-button-size: auto;
  padding: 0.35rem 0.75rem;
  font-size: var(--text-sm);
}

.el-button--small {
  padding: 0.25rem 0.5rem;
  font-size: var(--text-xs);
}

.el-button--large {
  padding: 0.5rem 1rem;
  font-size: var(--text-base);
}
</style> 