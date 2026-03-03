# Astralint

协作式图片拼图揭示应用。管理员上传源图拆分为网格，用户认领格子上传图片，审核通过后点亮，最终揭示完整图片。

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: MUI v7 + Emotion + Tailwind CSS v4
- **Backend**: Supabase (Database + Storage + Realtime)
- **Auth**: jose (JWT)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase 项目（需要创建数据库表和 Storage buckets）

### Setup

1. 克隆仓库：

```bash
git clone https://github.com/ji233/astralint.git
cd astralint
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 项目凭据和自定义密钥。

4. 启动开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## Scripts

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |

## Project Structure

```
app/
├── admin/          # 管理员页面（登录、仪表盘）
├── api/            # API 路由
├── components/     # 共享组件
├── layout.tsx      # 根布局
├── page.tsx        # 首页
└── theme.ts        # MUI 主题配置
lib/
├── auth.ts         # JWT 认证工具
├── grid.ts         # 网格计算工具
├── types.ts        # TypeScript 类型定义
└── supabase/       # Supabase 客户端（client / server / storage）
proxy.ts            # 路由守卫（管理员鉴权）
```

## License

MIT
