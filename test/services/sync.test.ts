import Rsync from 'rsync'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncFiles } from '../../src/services/sync'
import { ErrorCode, PluginError } from '../../src/types'

vi.mock('rsync')

describe('sync service', () => {
  const mockSourcePath = '/source/path'
  const mockTargetDir = '/target/dir'
  const mockSubpackageDir = 'subpackage/dir'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sync files successfully', async () => {
    const mockCmd = 'rsync command'
    const mockRsync = {
      execute: vi.fn().mockImplementation(callback => callback(null, 0, mockCmd)),
    }

    vi.mocked(Rsync.build).mockReturnValue(mockRsync as any)

    const result = await syncFiles(mockSourcePath, mockTargetDir, mockSubpackageDir)

    expect(result).toBe(mockCmd)
    expect(Rsync.build).toHaveBeenCalledWith({
      source: expect.stringContaining(mockSourcePath),
      destination: expect.stringContaining(mockTargetDir),
      flags: 'avz',
      quiet: true,
      delete: true,
    })
  })

  it('should throw PluginError when sync fails', async () => {
    const mockError = new Error('Sync failed')
    const mockRsync = {
      execute: vi.fn().mockImplementation(callback => callback(mockError, 1, '')),
    }

    vi.mocked(Rsync.build).mockReturnValue(mockRsync as any)

    await expect(syncFiles(mockSourcePath, mockTargetDir, mockSubpackageDir))
      .rejects
      .toThrow(PluginError)
    await expect(syncFiles(mockSourcePath, mockTargetDir, mockSubpackageDir))
      .rejects
      .toHaveProperty('code', ErrorCode.SYNC_FAILED)
  })
})
