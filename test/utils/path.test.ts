import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getDirPath, getFullPath } from '../../src/utils/path'

describe('path utils', () => {
  describe('getFullPath', () => {
    it('should resolve absolute path from segments', () => {
      const result = getFullPath('a', 'b', 'c')
      expect(result).toBe(path.resolve('a', 'b', 'c'))
    })

    it('should handle empty args', () => {
      const result = getFullPath()
      expect(result).toBe(path.resolve())
    })

    it('should handle absolute paths', () => {
      const absolutePath = '/absolute/path'
      const result = getFullPath(absolutePath, 'file.txt')
      expect(result).toBe(path.resolve(absolutePath, 'file.txt'))
    })
  })

  describe('getDirPath', () => {
    it('should get directory path from file path', () => {
      const filePath = 'path/to/file.txt'
      const result = getDirPath(filePath)
      expect(result).toBe('path/to')
    })

    it('should handle root path', () => {
      const filePath = '/root.txt'
      const result = getDirPath(filePath)
      expect(result).toBe('/')
    })

    it('should handle current directory', () => {
      const filePath = 'file.txt'
      const result = getDirPath(filePath)
      expect(result).toBe('.')
    })
  })
})
