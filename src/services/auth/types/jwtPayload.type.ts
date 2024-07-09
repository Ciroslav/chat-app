export type JwtPayload = {
  uuid: string;
  preferedUsername: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken?: string;
};

export type JwtWithDates = {
  uuid: string;
  preferedUsername: string;
  email: string;
  iat: string;
  exp: string;
  refreshToken?: string;
};
