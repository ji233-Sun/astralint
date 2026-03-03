# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astralint 是一个使用 Next.js App Router 构建的 Web 应用。

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + MUI (Material UI) v7 with Emotion
- **Linting**: ESLint 9 with eslint-config-next

## Commands

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## Project Structure

```
app/
├── layout.tsx    # 根布局，包含字体配置和全局元数据
├── page.tsx      # 首页
└── globals.css   # 全局样式 (Tailwind CSS v4 语法)
```

## Architecture Notes

- 使用 Next.js App Router（`app/` 目录）
- Tailwind CSS v4 使用 `@import "tailwindcss"` 语法，通过 `@tailwindcss/postcss` 插件处理
- TypeScript 路径别名 `@/*` 映射到项目根目录
- MUI v7 与 Emotion 集成用于组件库
- 字体使用 `next/font/google` 加载 Geist 和 Geist_Mono