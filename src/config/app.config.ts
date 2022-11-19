export default () => ({
  enviroment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.POSTGRES_HOST,
    password: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  },
});
