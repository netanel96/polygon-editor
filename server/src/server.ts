import dotenv from 'dotenv';

import mongoose from 'mongoose';

import app from './app';
import { logger } from './utils/logger';

dotenv.config();

async function startServer() {
  await mongoose.connect(
    process.env.MONGO_URL!,
  );

  logger.info('mongodb connected');

  app.listen(process.env.PORT, () => {
    logger.info('server started', {
      port: process.env.PORT,
    });
  });
}

startServer().catch(error => {
  logger.error('server failed to start', {
    error,
    inspectedError: logger.childError(error),
  });

  process.exit(1);
});
