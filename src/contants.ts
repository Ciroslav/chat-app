import { join } from 'path';

export const MESSAGE_DELETED = 'deleted message';
// 15 minutes Access Token lifespan
export const ACCESS_TOKEN_LIFETIME = 60 * 15 * 100; //tmp hack for local development
// 2 weeks Refresh Token lifespan
export const REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 14;

export const UUID_V4_LENGTH = 36;

export const STORAGE_ABSOLUTE_PATH = join(__dirname, '../public/assets');
export const MEDIA_ABSOLUTE_PATH = join(__dirname, '../public/assets/media');
export const AVATARS_ABSOLUTE_PATH = join(__dirname, '../public/assets/avatars');
