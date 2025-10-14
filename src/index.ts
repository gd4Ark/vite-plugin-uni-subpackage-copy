import type { Plugin, ResolvedConfig } from 'vite'
import path from 'node:path'
import fs from 'fs-extra'
import Rsync from 'rsync'

interface Write {
  /** 文件路径 */
  file: string
  /** 重写文件内容的回调函数 */
  write: (content: string, configPath: string) => string
}

interface PluginOptions {
  /** 原生项目根目录路径 */
  rootDir: string
  /** 分包目录路径 */
  subpackageDir: string
  /** 文件重写配置 */
  rewrite?: Write[]
}

let configPath = ''

/**
 * uniSubpackageCopyPlugin 插件
 * 将 uni-app 打包出来的分包拷贝到原生微信小程序项目里
 */
export default function uniSubpackageCopyPlugin(options: PluginOptions = {} as PluginOptions): Plugin {
  const { rootDir, subpackageDir, rewrite = [] } = options
  if (!rootDir || !subpackageDir) {
    throw new Error('请配置 rootDir 和 subpackageDir！！')
  }

  let publicBasePath = ''

  return {
    name: 'vite-plugin-uni-subpackage-copy',

    enforce: 'post',

    configResolved(resolvedConfig: ResolvedConfig) {
      if (resolvedConfig.define?.['process.env.UNI_PLATFORM'] !== '"mp-weixin"') {
        return
      }

      publicBasePath = resolvedConfig.base
    },

    async writeBundle(options: { dir?: string }) {
      const p = options.dir

      if (!p || !publicBasePath) {
        return
      }

      configPath = getFullPath(publicBasePath, p)

      await processRewrite(rewrite)
      await copyFiles(rootDir, subpackageDir)
    },
  }
}

/**
 * 获取完整路径
 * @param args 路径片段
 * @returns 完整路径
 */
function getFullPath(...args: string[]): string {
  return path.resolve(...args)
}

/**
 * 拷贝文件（rsync）
 * @param rootDir 根目录
 * @param subpackageDir 分包目录
 */
function copyFiles(rootDir: string, subpackageDir: string): Promise<string> {
  const fullPathSrc = getFullPath(configPath)
  const fullPathDestPath = getFullPath(rootDir, path.dirname(subpackageDir))

  return new Promise((resolve, reject) => {
    const rsync = Rsync.build({
      source: fullPathSrc,
      destination: fullPathDestPath,
      flags: 'avz',
      quiet: true,
      delete: true,
    })

    rsync.execute((error: Error | null, code: number, cmd: string) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(cmd)
      }
    })
  })
}

/**
 * 处理重写文件内容
 * @param rewrite 重写配置
 */
async function processRewrite(rewrite: Write[]): Promise<void> {
  await Promise.all(rewrite.map(({ file, write }) => modifyFile(file, write)))
}

/**
 * 修改文件内容
 * @param file 文件路径
 * @param modifyContent 修改文件内容的回调函数
 */
async function modifyFile(file: string, modifyContent: Write['write']): Promise<void> {
  const fullPathFile = getFullPath(configPath, file)

  try {
    const content = await fs.readFile(fullPathFile, 'utf8')
    const modifiedContent = modifyContent(content, configPath)
    await fs.writeFile(fullPathFile, modifiedContent, 'utf8')
  }
  catch (error) {
    console.error(`Error modifying file ${fullPathFile}:`, error)
  }
}
