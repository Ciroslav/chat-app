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
  Put,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { Response } from 'express';
import { SwaggerTags } from 'src/swagger';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import { fileUploadSchema } from './schemas/file-upload.schema';
import { AccessGuard } from 'src/common/guards';
import { GetCurrentUserData } from 'src/common/decorators';

@ApiTags(SwaggerTags.Storage)
@ApiBearerAuth()
@Controller('assets')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @UseGuards(AccessGuard)
  @Post('/media/:conversationId')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileUploadSchema)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFileToConversation(
    @UploadedFile() file: Express.Multer.File,
    @Param('conversationId') conversationId: string,
  ) {
    if (!file) {
      throw new NotFoundException('File not found in request');
    }
    await this.storageService.saveMedia(file.originalname, conversationId, file.buffer);
    return { message: 'File uploaded successfully' };
  }

  @Get('/media/:conversationId/:filename')
  async getMedia(
    @Param('conversationId') conversationId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const { buffer, mimeType } = await this.storageService.getMedia(conversationId, filename);
      res.setHeader('Content-Type', mimeType);
      res.send(buffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @UseGuards(AccessGuard)
  @Delete('/media/:conversationId/:filename')
  async deleteMedia(@Param('conversationId') conversationId: string, @Param('filename') filename: string) {
    await this.storageService.deleteMedia(conversationId, filename);
    return { message: 'File deleted successfully' };
  }

  @UseGuards(AccessGuard)
  @Put('/avatar')
  @UseGuards()
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileUploadSchema)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @GetCurrentUserData('uuid') uuid: string) {
    if (!file) {
      throw new NotFoundException('File not found in request');
    }
    await this.storageService.saveAvatar(uuid, file);
    return { message: 'File uploaded successfully' };
  }

  @Get('/avatar/:userId')
  async getAvatar(@Param('userId') uuid: string, @Res() res: Response) {
    try {
      const { buffer, mimeType } = await this.storageService.getAvatar(uuid);
      res.setHeader('Content-Type', mimeType);
      res.send(buffer);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('File not found');
    }
  }
  @UseGuards(AccessGuard)
  @Delete('/avatar')
  async deleteAvatar(@GetCurrentUserData('uuid') uuid: string) {
    await this.storageService.deleteAvatar(uuid);
    return { message: 'File deleted successfully' };
  }
}
