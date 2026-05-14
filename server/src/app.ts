import cors from 'cors';

import express from 'express';

import mongoose from 'mongoose';

import { ZodError } from 'zod';

import {
  createPolygonRouter,
  type PolygonModelLike,
} from './routes/polygonRoutes';

import { logger } from './utils/logger';
import { sleep } from './utils/sleep';

type AppOptions = {
  polygonModel?: PolygonModelLike;
  wait?: (ms: number) => Promise<unknown>;
};

function getStatusCode(error: unknown) {
  if (
    error instanceof ZodError ||
    error instanceof mongoose.Error.CastError
  ) {
    return 400;
  }

  if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400
  ) {
    return 400;
  }

  return 500;
}

export function createApp(options: AppOptions = {}) {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
    }),
  );

  app.use((request, response, next) => {
    const startedAt = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;

      const outcome =
        response.statusCode >= 500
          ? 'failed'
          : response.statusCode >= 400
            ? 'rejected'
            : 'success';

      const logDetails = {
        outcome,
        method: request.method,
        url: request.originalUrl,
        statusCode: response.statusCode,
        durationMs,
        ip: request.ip,
        errorMessage: response.locals.errorMessage,
      };

      if (response.statusCode >= 500) {
        logger.error('api request failed', logDetails);
        return;
      }

      logger.info('api request completed', logDetails);
    });

    next();
  });

  app.use(express.json());

  app.use(
    '/polygons',
    createPolygonRouter({
      polygonModel: options.polygonModel,
      wait: options.wait ?? sleep,
    }),
  );

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      const statusCode = getStatusCode(error);

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected server error';

      response.locals.errorMessage = message;

      logger.error('api route error', {
        statusCode,
        message,
      });

      response.status(statusCode).json({
        error:
          statusCode === 400
            ? message
            : 'Internal server error',
      });
    },
  );

  return app;
}

export default createApp();
