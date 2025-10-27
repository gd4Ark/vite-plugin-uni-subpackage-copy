import Rsync from 'rsync'
import { ErrorCode, PluginError } from '../types'
import { getDirPath, getFullPath } from '../utils/path'

/**
 * 同步文件
 * @param sourcePath 源路径
 * @param targetDir 目标目录
 * @param subpackageDir 分包目录
 */
export function syncFiles(
  sourcePath: string,
  targetDir: string,
  subpackageDir: string,
): Promise<string> {
  const fullPathSrc = getFullPath(sourcePath)
  const fullPathDestPath = getFullPath(targetDir, getDirPath(subpackageDir))

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
        reject(
          new PluginError(
            `Failed to sync files from ${fullPathSrc} to ${fullPathDestPath}`,
            ErrorCode.SYNC_FAILED,
            { error, code, cmd },
          ),
        )
      }
      else {
        resolve(cmd)
      }
    })
  })
}
