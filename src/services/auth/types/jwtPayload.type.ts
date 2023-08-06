export type JwtPayload = {
  uuid: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken?: string;
};
