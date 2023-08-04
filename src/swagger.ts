import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_BASE_PATH = 'api-docs';
export enum SwaggerTags {
  Authorization = 'Authorization',
  Users = 'Users',
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('User management Service')
    .setDescription('User management REST API documentation')
    .setVersion('1.0')
    .addTag(SwaggerTags.Authorization)
    .addTag(SwaggerTags.Users)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_BASE_PATH, app, document);
}
