# vite-plugin-uni-subpackage-copy

一个专为 uni-app 与原生微信小程序混合开发设计的 Vite 插件，帮助你将 uni-app 项目的分包内容自动同步到原生微信小程序项目中。

## 为什么需要这个插件？

在实际业务开发中，我们可能会遇到以下场景：

- 已有一个原生微信小程序项目，但想使用 uni-app 开发新功能
- 需要在原生微信小程序中集成 uni-app 开发的分包
- 渐进式重构，无需一次性重构所有页面

本插件就是为解决以上场景而生，让你的混合开发之路更加顺畅。

## 特性

- 完美支持原生微信小程序和 uni-app 混合开发模式
- 自动将 uni-app 分包实时同步到原生微信小程序项目中
- 使用 rsync 高效同步，支持热重载，开发体验流畅

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

4. **开发流程**

- 在原生小程序项目中开发主包内容
- 在 uni-app 项目中开发分包内容：
  - 运行 `pnpm dev:pkg-a` 开发 pkg-a 分包
  - 运行 `pnpm dev:pkg-b` 开发 pkg-b 分包
- 插件会自动将分包同步到原生项目中
- 在微信开发者工具中预览完整项目

你可以参考 playground 目录下的示例项目来进行配置和开发。
