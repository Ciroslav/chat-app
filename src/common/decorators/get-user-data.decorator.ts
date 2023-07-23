import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type userSessionMetadata =
  | 'uuid'
  | 'email'
  | 'username'
  | 'iat'
  | 'exp'
  | 'refreshToken';

export const GetCurrentUserData = createParamDecorator(
  (data: userSessionMetadata | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
