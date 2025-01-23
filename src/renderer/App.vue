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
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/repositories">
              <el-icon><Document /></el-icon>
              <span>仓库管理</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
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
import { House, Document, Setting } from '@element-plus/icons-vue';
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
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
</style> 