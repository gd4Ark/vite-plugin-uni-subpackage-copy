import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
// @ts-nocheck
import uniSubpackageCopy from 'vite-plugin-uni-subpackage-copy'

const uniPlugin = uni() as any

export default defineConfig({
  plugins: [
    uniPlugin,
    // eslint-disable-next-line node/prefer-global/process
    process.env.UNI_PLATFORM === 'mp-weixin' && uniSubpackageCopy({
      rootDir: '../miniprogram',

      // eslint-disable-next-line node/prefer-global/process
      subpackageDir: process.env.UNI_SUBPACKAGE as string,
    }),
  ],
})
