import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { Response } from 'express';
import { SwaggerTags } from 'src/swagger';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';

@ApiTags(SwaggerTags.Storage)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('File not found in request');
    }
    await this.storageService.saveFile(file.originalname, file.buffer);
    return { message: 'File uploaded successfully' };
  }
  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const { buffer, mimeType } = await this.storageService.getFile(filename);
      res.setHeader('Content-Type', mimeType);
      res.send(buffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    await this.storageService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }
}
