import path from 'node:path'

/**
 * 获取完整路径
 * @param args 路径片段
 * @returns 完整路径
 */
export function getFullPath(...args: string[]): string {
  return path.resolve(...args)
}

/**
 * 获取目录路径
 * @param filePath 文件路径
 * @returns 目录路径
 */
export function getDirPath(filePath: string): string {
  return path.dirname(filePath)
}
