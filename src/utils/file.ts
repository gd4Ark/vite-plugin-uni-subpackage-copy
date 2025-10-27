import type { Write } from '../types'
import fs from 'fs-extra'
import { ErrorCode, PluginError } from '../types'
import { getFullPath } from './path'

/**
 * 修改文件内容
 * @param file 文件路径
 * @param modifyContent 修改文件内容的回调函数
 * @param basePath 基础路径
 */
export async function modifyFile(
  file: string,
  modifyContent: Write['write'],
  basePath: string,
): Promise<void> {
  const fullPathFile = getFullPath(basePath, file)

  try {
    const content = await fs.readFile(fullPathFile, 'utf8')
    const modifiedContent = modifyContent(content, basePath)
    await fs.writeFile(fullPathFile, modifiedContent, 'utf8')
  }
  catch (error) {
    throw new PluginError(
      `Failed to modify file ${fullPathFile}`,
      ErrorCode.REWRITE_FAILED,
      error,
    )
  }
}
