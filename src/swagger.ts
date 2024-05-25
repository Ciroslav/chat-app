import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_BASE_PATH = 'api-docs';
export enum SwaggerTags {
  Authorization = 'Authorization',
  Users = 'Users',
  Relations = 'Relations',
  Conversations = 'Conversations',
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Chat Application monolith')
    .setDescription('Chat app REST API doccumentation')
    .setVersion('1.0')
    .addTag(SwaggerTags.Authorization)
    .addTag(SwaggerTags.Users)
    .addTag(SwaggerTags.Relations)
    .addTag(SwaggerTags.Conversations)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_BASE_PATH, app, document);
}
