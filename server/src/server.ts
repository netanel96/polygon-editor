import mongoose from 'mongoose';

import {createApp} from './app';
import {config} from './config';
import {logger} from './utils/logger';

async function startServer() {
  const app = await createApp();

  await mongoose.connect(config.mongoUrl);
  logger.info('mongodb connected');


  app.listen(config.port, () => {
    logger.info('server started', {
      port: config.port,
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
