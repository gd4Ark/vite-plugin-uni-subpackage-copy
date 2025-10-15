# vite-plugin-uni-subpackage-copy

一个帮助你将 uni-app 集成到原生微信小程序进行混合开发的 Vite 插件。

阅读 [《uni-app 与原生小程序混合开发方案》](https://4ark.me/posts/2025-10-15-uni-app-hybrid-native-miniprogram/) 了解详细背景。

## 为什么需要这个插件？

满足以下场景：

- 原有项目较为稳定，仅需要在其基础上新增某些复杂且相对独立的模块
- 全面重构成本高，收益低，需要一个渐进式的混合开发方案

本插件提供了一种优雅的解决方案：

- 将 uni-app 项目打包成小程序分包，集成到原生项目中
- 支持将功能同时分发到 APP、H5 等多个平台
- 可按需拆分多个分包，避免微信小程序 2M 分包限制

## 特性

- 使用 rsync 高效同步，支持热重载，开发体验流畅
- 自动将 uni-app 分包实时同步到原生项目
- 支持文件内容重写，方便处理配置和依赖
- 支持多分包构建，灵活管理包体积

## 安装

```bash
pnpm add vite-plugin-uni-subpackage-copy -D
```

## 使用

### 项目结构

推荐的项目结构如下：

```
.
├── miniprogram/          # 原生微信小程序项目目录
│   ├── app.js
│   ├── app.json
│   └── ...
└── uni-app-project/     # uni-app 项目目录
    ├── src/
    ├── vite.config.ts
    └── ...
```

### 配置步骤

1. 在 uni-app 项目的 `vite.config.ts` 中添加插件：

```ts
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import uniSubpackageCopy from 'vite-plugin-uni-subpackage-copy'

export default defineConfig({
  plugins: [
    uni(),
    process.env.UNI_PLATFORM === 'mp-weixin' && uniSubpackageCopy({
      rootDir: '../miniprogram',
      subpackageDir: process.env.UNI_SUBPACKAGE,
    })
  ]
})
```

## 配置

### 插件选项

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `rootDir` | `string` | `''` | 原生微信小程序代码的根目录 |
| `subpackageDir` | `string` | `''` | 分包目录路径 |
| `rewrite` | `Array<Write>` | `[]` | 文件内容重写配置 |

### 类型定义

```ts
interface Write {
  /** 文件路径 */
  file: string
  /** 重写文件内容的回调函数 */
  write: (content: string, configPath: string) => string
}
```

## 示例

### 基础配置示例

下面是该插件的基础配置示例：

```ts
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import uniSubpackageCopy from 'vite-plugin-uni-subpackage-copy'

export default defineConfig({
  plugins: [
    uni(),
    process.env.UNI_PLATFORM === 'mp-weixin' && uniSubpackageCopy({
      rootDir: '../miniprogram',
      subpackageDir: process.env.UNI_SUBPACKAGE,
      rewrite: [
        {
          file: 'app.json',
          write: (content, configPath) => {
            const appJson = JSON.parse(content)
            // 修改文件内容
            return JSON.stringify(appJson, null, 2)
          },
        },
      ],
    }),
  ],
})
```

### 实际开发示例

1. **项目配置**

在 uni-app 项目的 `package.json` 中配置分包构建命令：

```json
{
  "scripts": {
    "dev": "run-p 'dev:**'",
    "build": "run-p 'build:**'",
    "dev:pkg-a": "uni -p pkg-a --subpackage=pkg-a",
    "build:pkg-a": "uni build -p pkg-a --subpackage=pkg-a",
    "dev:pkg-b": "uni -p pkg-b --subpackage=pkg-b",
    "build:pkg-b": "uni build -p pkg-b --subpackage=pkg-b"
  },
  "uni-app": {
    "scripts": {
      "pkg-a": {
        "title": "pkg-a",
        "env": {
          "UNI_PLATFORM": "mp-weixin"
        },
        "define": {
          "MP-PKG-A": true
        }
      },
      "pkg-b": {
        "title": "pkg-b",
        "env": {
          "UNI_PLATFORM": "mp-weixin"
        },
        "define": {
          "MP-PKG-B": true
        }
      }
    }
  }
}
```

2. **分包配置**

在 uni-app 项目的 `pages.json` 中使用条件编译配置分包页面：

```json
{
  "pages": [
    // #ifdef MP-PKG-A
    {
      "path": "pages/index/index"
    },
    // #endif
    // #ifdef MP-PKG-B
    {
      "path": "pages/detail/index"
    }
    // #endif
  ]
}
```

在原生小程序的 `app.json` 中配置分包：

```json
{
  "pages": [
    "pages/index/index"
  ],
  "subpackages": [
    {
      "root": "pkg-a",
      "pages": [
        "pages/index/index"
      ]
    },
    {
      "root": "pkg-b",
      "pages": [
        "pages/detail/index"
      ]
    }
  ]
}
```

3. **插件配置**

在 uni-app 项目的 `vite.config.ts` 中配置插件：

```ts
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import uniSubpackageCopy from 'vite-plugin-uni-subpackage-copy'

export default defineConfig({
  plugins: [
    uni(),
    process.env.UNI_PLATFORM === 'mp-weixin' && uniSubpackageCopy({
      rootDir: '../miniprogram',
      subpackageDir: process.env.UNI_SUBPACKAGE,
    })
  ]
})
```

你可以参考 playground 目录下的示例项目来进行配置和开发。
