import { Injectable, NotFoundException } from '@nestjs/common';
import path, { join, normalize } from 'path';
import { promises as fs } from 'fs';
import { AVATARS_ABSOLUTE_PATH, MEDIA_ABSOLUTE_PATH, UUID_V4_LENGTH } from 'src/contants';
import * as mime from 'mime-types';

@Injectable()
export class StorageService {
  private readonly mediaPath = MEDIA_ABSOLUTE_PATH;
  private readonly avatarPath = AVATARS_ABSOLUTE_PATH;

  constructor() {
    (async () => {
      this.initializeStorageDirs();
    })();
  }

  async saveMedia(filename: string, conversationId: string, data: Buffer) {
    const filePath = join(this.mediaPath, conversationId);
    await fs.mkdir(filePath, { recursive: true });
    const sanitizedFilePath = this.sanitizePath(filePath, filename);
    await fs.writeFile(sanitizedFilePath, data);
  }

  async getMedia(conversationId: string, filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const filePath = join(this.mediaPath, conversationId);
    const conversationDirExists = await this.directoryExists(filePath);
    if (!conversationDirExists) {
      throw new NotFoundException('File not found');
    }
    try {
      const sanitizedFilePath = this.sanitizePath(filePath, filename);
      const buffer = await fs.readFile(sanitizedFilePath);
      const mimeType = mime.lookup(sanitizedFilePath);
      return { buffer, mimeType };
    } catch (error) {
      console.error(error);
      throw new NotFoundException('File not found');
    }
  }

  async deleteMedia(conversationId: string, filename: string): Promise<void> {
    const filePath = join(this.mediaPath, conversationId);
    const conversationDirExists = await this.directoryExists(filePath);
    if (!conversationDirExists) {
      throw new NotFoundException('File not found');
    }
    try {
      const sanitizedFilePath = this.sanitizePath(filePath, filename);
      await fs.unlink(sanitizedFilePath);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('File not found');
    }
  }
  async saveAvatar(uuid: string, file: Express.Multer.File) {
    const extension = mime.extension(file.mimetype);
    const filename = `${uuid}.${extension}`;
    const filePath = this.sanitizePath(this.avatarPath, filename);
    await fs.writeFile(filePath, file.buffer);
  }

  async getAvatar(uuid: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const files = await fs.readdir(this.avatarPath);
    const filename = files.find((file) => file.startsWith(uuid));

    if (!filename || uuid.length != UUID_V4_LENGTH) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(this.avatarPath, filename);
    const buffer = await fs.readFile(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    return { buffer, mimeType };
  }

  async deleteAvatar(uuid: string) {
    const files = await fs.readdir(this.avatarPath);
    const filename = files.find((file) => file.startsWith(uuid));

    if (!filename || uuid.length != UUID_V4_LENGTH) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(this.avatarPath, filename);
    await fs.unlink(filePath);
  }

  private sanitizePath(path: string, fileName: string): string {
    const normalizedPath = normalize(path);
    const sanitizedFileName = fileName.replace(/^(\.\.(\/|\\|$))+/, '');
    return join(normalizedPath, sanitizedFileName);
  }
  private async directoryExists(path: string) {
    try {
      await fs.access(path);
      return true;
    } catch (error) {
      return false;
    }
  }
  private async initializeStorageDirs() {
    try {
      await fs.mkdir(this.mediaPath, { recursive: true });
      await fs.mkdir(this.avatarPath, { recursive: true });
    } catch (error) {
      throw new Error('Failed to create directories for media');
    }
  }
}
