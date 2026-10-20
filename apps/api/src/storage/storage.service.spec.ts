import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { StorageService } from './storage.service.js';

describe('StorageService', () => {
  it('writes a sanitised local file when no S3 bucket is configured', async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'igshorts-storage-'));
    const cwd = process.cwd();
    process.chdir(tmp);
    try {
      const service = new StorageService({
        get: () => '',
      } as never);
      const saved = await service.saveFile('../../evil name.xlsx', Buffer.from('hello'));
      expect(saved.endsWith('evil_name.xlsx') || saved.includes('evil_name.xlsx')).toBe(true);
      const body = await readFile(saved);
      expect(body.toString()).toBe('hello');
    } finally {
      process.chdir(cwd);
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
