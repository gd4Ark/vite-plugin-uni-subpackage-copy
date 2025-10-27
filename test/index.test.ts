import type { ResolvedConfig } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import uniSubpackageCopyPlugin from '../src'
import * as rewriteService from '../src/services/rewrite'
import * as syncService from '../src/services/sync'
import { ErrorCode, PluginError } from '../src/types'

vi.mock('../src/services/sync')
vi.mock('../src/services/rewrite')

describe('uniSubpackageCopyPlugin', () => {
  const mockOptions = {
    rootDir: '/root/dir',
    subpackageDir: 'subpackage/dir',
    rewrite: [
      {
        file: 'test.json',
        write: vi.fn(),
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error when required options are missing', () => {
    expect(() => uniSubpackageCopyPlugin({}))
      .toThrow(new PluginError('rootDir and subpackageDir are required', ErrorCode.MISSING_CONFIG))
  })

  it('should create plugin with correct name and enforce', () => {
    const plugin = uniSubpackageCopyPlugin(mockOptions)
    expect(plugin.name).toBe('vite-plugin-uni-subpackage-copy')
    expect(plugin.enforce).toBe('post')
  })

  describe('configResolved', () => {
    it('should set publicBasePath when platform is mp-weixin', async () => {
      const plugin = uniSubpackageCopyPlugin(mockOptions)
      const mockConfig = {
        base: '/base/path/',
        define: {
          'process.env.UNI_PLATFORM': '"mp-weixin"',
        },
      } as ResolvedConfig

      vi.mocked(syncService.syncFiles).mockResolvedValue('sync command')
      vi.mocked(rewriteService.processRewrite).mockResolvedValue()

      plugin.configResolved?.(mockConfig)
      await plugin.writeBundle?.({ dir: '/output/dir' })

      expect(rewriteService.processRewrite).toHaveBeenCalledWith(
        mockOptions.rewrite,
        '/output/dir',
      )
      expect(syncService.syncFiles).toHaveBeenCalledWith(
        '/output/dir',
        mockOptions.rootDir,
        mockOptions.subpackageDir,
      )
    })

    it('should not set publicBasePath for other platforms', async () => {
      const plugin = uniSubpackageCopyPlugin(mockOptions)
      const mockConfig = {
        base: '/base/path/',
        define: {
          'process.env.UNI_PLATFORM': '"h5"',
        },
      } as ResolvedConfig

      plugin.configResolved?.(mockConfig)
      await plugin.writeBundle?.({ dir: '/output/dir' })

      expect(syncService.syncFiles).not.toHaveBeenCalled()
      expect(rewriteService.processRewrite).not.toHaveBeenCalled()
    })
  })

  describe('writeBundle', () => {
    it('should process rewrite and sync files when dir is provided', async () => {
      const plugin = uniSubpackageCopyPlugin(mockOptions)
      const mockConfig = {
        base: '/base/path/',
        define: {
          'process.env.UNI_PLATFORM': '"mp-weixin"',
        },
      } as ResolvedConfig

      vi.mocked(syncService.syncFiles).mockResolvedValue('sync command')
      vi.mocked(rewriteService.processRewrite).mockResolvedValue()

      plugin.configResolved?.(mockConfig)
      await plugin.writeBundle?.({ dir: '/output/dir' })

      expect(rewriteService.processRewrite).toHaveBeenCalledWith(
        mockOptions.rewrite,
        '/output/dir',
      )
      expect(syncService.syncFiles).toHaveBeenCalledWith(
        '/output/dir',
        mockOptions.rootDir,
        mockOptions.subpackageDir,
      )
    })

    it('should not process when dir is not provided', async () => {
      const plugin = uniSubpackageCopyPlugin(mockOptions)
      const mockConfig = {
        base: '/base/path/',
        define: {
          'process.env.UNI_PLATFORM': '"mp-weixin"',
        },
      } as ResolvedConfig

      plugin.configResolved?.(mockConfig)
      await plugin.writeBundle?.({})

      expect(syncService.syncFiles).not.toHaveBeenCalled()
      expect(rewriteService.processRewrite).not.toHaveBeenCalled()
    })
  })
})
