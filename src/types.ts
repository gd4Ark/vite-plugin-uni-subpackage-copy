import type { Plugin } from 'vite'

export interface Write {
  /** 文件路径 */
  file: string
  /** 重写文件内容的回调函数 */
  write: (content: string, configPath: string) => string
}

export interface PluginOptions {
  /** 原生项目根目录路径 */
  rootDir: string
  /** 分包目录路径 */
  subpackageDir: string
  /** 文件重写配置 */
  rewrite?: Write[]
}

export enum ErrorCode {
  MISSING_CONFIG = 'MISSING_CONFIG',
  SYNC_FAILED = 'SYNC_FAILED',
  REWRITE_FAILED = 'REWRITE_FAILED',
}

export class PluginError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'PluginError'
  }
}

export type UniSubpackageCopyPlugin = Plugin
