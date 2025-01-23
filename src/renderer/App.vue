<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="nav">
      <router-link to="/" class="nav-item">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/repositories" class="nav-item">
        <i class="fas fa-code-branch"></i>
        <span>仓库</span>
      </router-link>
      <router-link to="/analytics" class="nav-item">
        <i class="fas fa-chart-bar"></i>
        <span>分析</span>
      </router-link>
      <router-link to="/settings" class="nav-item">
        <i class="fas fa-cog"></i>
        <span>设置</span>
      </router-link>
    </nav>

    <!-- 主内容区 -->
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 检查认证状态
onMounted(async () => {
  try {
    await authStore.checkAuthStatus();
    if (!authStore.isAuthenticated) {
      router.push('/settings');
    }
  } catch (error) {
    console.error('检查认证状态失败:', error);
  }
});
</script>

<style>
.app {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.nav {
  width: 200px;
  padding: 20px;
  background-color: var(--nav-bg-color);
  border-right: 1px solid var(--border-color);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: var(--hover-color);
}

.nav-item.router-link-active {
  background-color: var(--active-color);
  color: var(--primary-color);
}

.nav-item i {
  margin-right: 12px;
  font-size: 1.2em;
}

.main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 主题变量 */
:root {
  /* 浅色主题 */
  --bg-color: #f5f6fa;
  --nav-bg-color: #ffffff;
  --text-color: #2c3e50;
  --border-color: #e1e4e8;
  --hover-color: #f1f2f6;
  --active-color: #e3f2fd;
  --primary-color: #1976d2;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --nav-bg-color: #2d2d2d;
    --text-color: #e1e1e1;
    --border-color: #404040;
    --hover-color: #3d3d3d;
    --active-color: #0d47a1;
    --primary-color: #42a5f5;
  }
}
</style> 