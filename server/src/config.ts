import dotenv from 'dotenv';

dotenv.config();

const defaultClientUrls = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const configuredClientUrls = (process.env.CLIENT_URL ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

export const config = {
  port: process.env.PORT ?? '4000',
  mongoUrl:
    process.env.MONGO_URL ??
    'mongodb://localhost:27017/polygon-editor',
  clientUrls: Array.from(
    new Set([
      ...defaultClientUrls,
      ...configuredClientUrls,
    ]),
  ),
  logFilePath:
    process.env.LOG_FILE_PATH ?? 'logs/server.log',
  logOutput: process.env.LOG_OUTPUT ?? 'console,file',
  logTransport: process.env.LOG_TRANSPORT ?? 'local',
};
