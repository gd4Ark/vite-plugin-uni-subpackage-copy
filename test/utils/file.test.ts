import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode, PluginError } from '../../src/types'
import { modifyFile } from '../../src/utils/file'

vi.mock('fs-extra')

describe('file utils', () => {
  const mockBasePath = '/base/path'
  const mockFile = 'test.json'
  const mockContent = '{"test": true}'
  const mockModifiedContent = '{"test": false}'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('modifyFile', () => {
    it('should modify file content successfully', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)
      vi.mocked(fs.writeFile).mockResolvedValue()

      const mockWrite = vi.fn().mockReturnValue(mockModifiedContent)

      await modifyFile(mockFile, mockWrite, mockBasePath)

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(mockFile),
        'utf8',
      )
      expect(mockWrite).toHaveBeenCalledWith(mockContent, mockBasePath)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(mockFile),
        mockModifiedContent,
        'utf8',
      )
    })

    it('should throw PluginError when read fails', async () => {
      const mockError = new Error('Read failed')
      vi.mocked(fs.readFile).mockRejectedValue(mockError)

      const mockWrite = vi.fn()

      await expect(modifyFile(mockFile, mockWrite, mockBasePath))
        .rejects
        .toThrow(PluginError)
      await expect(modifyFile(mockFile, mockWrite, mockBasePath))
        .rejects
        .toHaveProperty('code', ErrorCode.REWRITE_FAILED)

      expect(mockWrite).not.toHaveBeenCalled()
      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('should throw PluginError when write fails', async () => {
      const mockError = new Error('Write failed')
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)
      vi.mocked(fs.writeFile).mockRejectedValue(mockError)

      const mockWrite = vi.fn().mockReturnValue(mockModifiedContent)

      await expect(modifyFile(mockFile, mockWrite, mockBasePath))
        .rejects
        .toThrow(PluginError)
      await expect(modifyFile(mockFile, mockWrite, mockBasePath))
        .rejects
        .toHaveProperty('code', ErrorCode.REWRITE_FAILED)

      expect(mockWrite).toHaveBeenCalled()
    })
  })
})
