import { Injectable, NotFoundException } from '@nestjs/common';
import { join, normalize } from 'path';
import { promises as fs } from 'fs';
import { STORAGE_ABSOLUTE_PATH } from 'src/contants';

@Injectable()
export class StorageService {
  private readonly storagePath = STORAGE_ABSOLUTE_PATH;

  async saveFile(filename: string, data: Buffer) {
    const filePath = this.sanitizePath(this.storagePath, filename);
    await fs.writeFile(filePath, data);
  }

  async getFile(filename: string): Promise<Buffer> {
    const filePath = this.sanitizePath(this.storagePath, filename);
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = this.sanitizePath(this.storagePath, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
  private sanitizePath(path: string, fileName: string): string {
    const normalizedPath = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');
    const sanitizedFileName = fileName.replace(/^(\.\.(\/|\\|$))+/, '');
    return join(normalizedPath, sanitizedFileName);
  }
}
