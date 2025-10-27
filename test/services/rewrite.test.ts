import { beforeEach, describe, expect, it, vi } from 'vitest'
import { processRewrite } from '../../src/services/rewrite'
import * as fileUtils from '../../src/utils/file'

vi.mock('../../src/utils/file')

describe('rewrite service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process multiple rewrites in parallel', async () => {
    const mockBasePath = '/base/path'
    const mockRewrites = [
      {
        file: 'file1.json',
        write: vi.fn(),
      },
      {
        file: 'file2.json',
        write: vi.fn(),
      },
    ]

    vi.mocked(fileUtils.modifyFile).mockResolvedValue()

    await processRewrite(mockRewrites, mockBasePath)

    expect(fileUtils.modifyFile).toHaveBeenCalledTimes(2)
    expect(fileUtils.modifyFile).toHaveBeenCalledWith(
      mockRewrites[0].file,
      mockRewrites[0].write,
      mockBasePath,
    )
    expect(fileUtils.modifyFile).toHaveBeenCalledWith(
      mockRewrites[1].file,
      mockRewrites[1].write,
      mockBasePath,
    )
  })

  it('should handle empty rewrites array', async () => {
    const mockBasePath = '/base/path'
    await processRewrite([], mockBasePath)
    expect(fileUtils.modifyFile).not.toHaveBeenCalled()
  })

  it('should propagate errors from modifyFile', async () => {
    const mockError = new Error('Rewrite failed')
    const mockBasePath = '/base/path'
    const mockRewrites = [
      {
        file: 'file.json',
        write: vi.fn(),
      },
    ]

    vi.mocked(fileUtils.modifyFile).mockRejectedValue(mockError)

    await expect(processRewrite(mockRewrites, mockBasePath))
      .rejects
      .toThrow(mockError)
  })
})
