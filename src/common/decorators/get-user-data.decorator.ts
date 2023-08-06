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
    // console.log(request);
    if (!data) return request.user;

    if (data === 'refreshToken') {
      // Look for the refresh token in the Authorization header
      const refreshToken = request.headers.authorization
        ? request.headers.authorization.replace('Bearer', '').trim()
        : null;
      return refreshToken;
    }

    return request.user[data];
  },
);
