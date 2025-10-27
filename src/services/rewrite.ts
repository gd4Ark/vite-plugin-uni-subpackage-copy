import type { Write } from '../types'
import { modifyFile } from '../utils/file'

/**
 * 处理重写文件内容
 * @param rewrite 重写配置
 * @param basePath 基础路径
 */
export async function processRewrite(rewrite: Write[], basePath: string): Promise<void> {
  await Promise.all(
    rewrite.map(({ file, write }) => modifyFile(file, write, basePath)),
  )
}
