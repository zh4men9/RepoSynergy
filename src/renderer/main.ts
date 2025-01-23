import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/index.css';

// 创建Vue应用
const app = createApp(App);

// 使用Pinia状态管理
app.use(createPinia());

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app'); 