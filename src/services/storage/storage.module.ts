import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/public'),
    }),
    MulterModule.register({
      dest: './public',
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
