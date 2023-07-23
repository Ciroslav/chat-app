import { JwtPayload } from './jwtPayload.type';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
