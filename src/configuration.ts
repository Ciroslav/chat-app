export default () => ({
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  JWT_SECRETS: {
    AT_SECRET: process.env.ACCESS_TOKEN_SECRET,
    RT_SECRET: process.env.REFRESH_TOKEN_SECRET,
  },
});
