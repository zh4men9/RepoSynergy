import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import './assets/styles/index.css';

// 创建Vue应用
const app = createApp(App);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用Pinia状态管理
app.use(createPinia());

// 使用路由
app.use(router);

app.use(ElementPlus);

// 挂载应用
app.mount('#app'); 