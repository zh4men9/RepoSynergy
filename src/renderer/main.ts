import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { setupElementPlus } from './plugins/element-plus';
import './assets/styles/index.css';

// 创建Vue应用
const app = createApp(App);
const pinia = createPinia();

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 配置 Element Plus
setupElementPlus(app);

// 使用Pinia状态管理
app.use(pinia);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app'); 