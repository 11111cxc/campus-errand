# 校园跑腿通（Omniflow Fullstack）

面向校园场景的互助跑腿平台：同学可发布取快递、带饭等跑腿需求，其他同学接单配送，平台对订单内容做合规检测，并提供 AI 助手答疑。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端 | React 18、TypeScript、Vite 5、Tailwind CSS 4、shadcn/ui、React Router 6 |
| 后端 | Express 4、TypeScript（tsx 直跑）、SSE 流式响应 |
| 数据 | 内存存储（订单数据随进程重启重置） |
| 部署 | 后端单端口托管前端构建产物，`vercel.json` 预留 Serverless 部署 |

## 目录结构

```
backend/          后端
  server.ts       服务入口：托管 frontend/dist + 注册 API 路由
  routes/         orders（订单）、ai（AI 对话）、speech（语音转写）
  services/       aiService：对接 Omniflow LLM 与知识库
  config/         constants、passport、s3
  db/             Drizzle ORM 数据库连接
  middleware/     统一错误处理
frontend/         前端
  src/pages/      Index（任务大厅）、Publish（发布订单）、MyOrders（我的订单）
  src/components/ Navbar、OrderCard、AiAssistant 等
  src/contexts/   AuthContext（预留，尚未启用）
shared/           前后端共用类型定义
```

## 本地运行

```powershell
# 1. 安装依赖（前端需 --legacy-peer-deps，否则 Radix 相关包 peer 冲突）
npm install
cd frontend; npm install --legacy-peer-deps; cd ..

# 2. 构建前端（产物输出到 frontend/dist）
cd frontend; npm run build; cd ..

# 3. 启动后端（同时托管前端页面与 API）
$env:PORT=3000
npm start
```

浏览器打开 <http://localhost:3000> 即可。

开发模式（热更新）需自行在 `frontend/vite.config.ts` 中配置 `/api` 代理到后端端口，否则前端请求会 404。

## 环境变量

在项目根目录创建 `.env`（该文件已被 `.gitignore` 排除）：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `PORT` | 是 | 服务端口，未设置会导致端口随机 |
| `OMNIFLOW_API_KEY` | 否 | AI 助手与语音转写密钥，缺失时 `/api/ai/chat` 返回 500 |
| `OMNIFLOW_API_BASE_URL` | 否 | 默认 `https://app.omniflowai.com/api` |
| `DATABASE_URL` | 否 | Drizzle 数据库连接，仅使用 db 模块时需要 |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | 否 | 对象存储，仅使用 s3 模块时需要 |

## 功能清单

- 任务大厅：分类筛选（全部 / 代取快递 / 代购食堂）、订单卡片、一键接单
- 发布订单：类型、标题、详情、取送地点、报酬，提交时做违规关键词检测
- 我的订单：我发布的 / 我接单的 两个视图，配送中订单可标记完成
- 合规检测：命中违禁关键词的订单静默拦截，不向发布者暴露判定原因
- AI 助手：SSE 流式问答（需配置密钥并挂载组件）

## 已知限制

1. 订单数据存于进程内存，重启即重置，未接入数据库。
2. 无注册登录流程：`AuthContext` 未挂载，后端未提供 `/api/auth` 路由。
3. AI 助手组件尚未挂载到页面，且依赖外部密钥。
