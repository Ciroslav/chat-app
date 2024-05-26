export type JwtPayload = {
  uuid: string;
  preferedUsername: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken?: string;
};
