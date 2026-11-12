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
  routes/         auth（注册登录）、orders（订单）、ai（AI 对话）、speech（语音转写）
  middleware/     auth（JWT 解析与角色校验）、errorHandler（统一错误处理）
  services/       aiService：对接 Omniflow LLM 与知识库
  config/         constants、passport、s3
  db/             Drizzle ORM 数据库连接
frontend/         前端
  src/pages/      Index（任务大厅）、Publish（发布订单）、MyOrders（我的订单）、Auth（注册登录）
  src/components/ Navbar、OrderCard、AiAssistant 等
  src/contexts/   AuthContext（登录态、角色、鉴权请求）
  public/         demo.html（课堂演示用快速登录入口）
shared/           前后端共用类型定义（orders、users）
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
| `JWT_SECRET` | 否 | 登录令牌签名密钥，缺失时使用内置开发密钥 |
| `DATABASE_URL` | 否 | Drizzle 数据库连接，仅使用 db 模块时需要 |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | 否 | 对象存储，仅使用 s3 模块时需要 |

## 功能清单

- 账号体系：注册时选择账号类型（需求方 / 跑腿员），登录签发 JWT，导航栏显示昵称、类型与学号
- 角色权限：需求方只能发布、跑腿员只能接单、仅接单人能确认完成；越权请求在后端返回 401 / 403
- 任务大厅：分类筛选（全部 / 代取快递 / 代购食堂）、订单卡片、按身份给"接单"入口
- 发布订单：类型、标题、详情、取送地点、报酬，提交时做违规关键词检测
- 我的订单：我发布的 / 我接单的 两个视图，按当前登录账号过滤，配送中订单可标记完成
- 合规检测：命中违禁关键词的订单静默拦截，不向发布者暴露判定原因
- AI 助手：SSE 流式问答（需配置密钥并挂载组件）

## 演示账号

服务启动时预置两个不同类型的账号，密码均为 `123456`：

| 学号 | 昵称 | 类型 | 能做什么 |
| --- | --- | --- | --- |
| 20230101 | 李同学 | 需求方 | 发布订单、查看我发布的 |
| 20230102 | 王同学 | 跑腿员 | 接单、确认完成、查看我接单的 |

也可以在「注册」页自行注册新的两类账号。演示录屏时可用 `http://localhost:3000/demo.html?student=20230102&to=my-orders` 快速切换到指定账号。

## 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 注册，body 需含 `studentId`、`name`、`password`、`role` |
| POST | `/api/auth/login` | 登录，返回 token 与用户信息 |
| GET | `/api/auth/me` | 校验登录态（Bearer token） |
| GET | `/api/auth/accounts` | 演示账号列表 |
| GET | `/api/orders` | 订单列表（免登录） |
| GET | `/api/orders/mine` | 当前用户的"我发布的 / 我接的" |
| POST | `/api/orders` | 发布订单（仅需求方） |
| POST | `/api/orders/:id/take` | 接单（仅跑腿员） |
| POST | `/api/orders/:id/complete` | 确认完成（仅接单人） |

## 已知限制

1. 账号与订单数据存于进程内存，重启即重置，未接入数据库。
2. 密码使用 scrypt 加盐哈希存储，但未实现找回密码、改密、注销等流程。
3. AI 助手组件尚未挂载到页面，且依赖外部密钥。
