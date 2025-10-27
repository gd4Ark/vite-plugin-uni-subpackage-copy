import type { ResolvedConfig } from 'vite'
import type { PluginOptions, UniSubpackageCopyPlugin } from './types'
import { processRewrite } from './services/rewrite'
import { syncFiles } from './services/sync'
import { ErrorCode, PluginError } from './types'

let configPath = ''

/**
 * uniSubpackageCopyPlugin 插件
 * 将 uni-app 打包出来的分包拷贝到原生微信小程序项目里
 */
export default function uniSubpackageCopyPlugin(
  options: PluginOptions = {} as PluginOptions,
): UniSubpackageCopyPlugin {
  const { rootDir, subpackageDir, rewrite = [] } = options

  if (!rootDir || !subpackageDir) {
    throw new PluginError(
      'rootDir and subpackageDir are required',
      ErrorCode.MISSING_CONFIG,
    )
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

      configPath = p

      await processRewrite(rewrite, configPath)
      await syncFiles(configPath, rootDir, subpackageDir)
    },
  }
}
