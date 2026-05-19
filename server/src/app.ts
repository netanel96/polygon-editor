import cors from 'cors';
import express from 'express';

import mongoose from 'mongoose';

import {ZodError} from 'zod';

import type {PolygonModelLike} from './polygons/persistence';
import {createPolygonRouter} from './polygons/http';

import {config} from './config';
import {logger} from './utils/logger';
import {sleep} from './utils/sleep';
import {ConnectionBackedPolygonEventBroker, PolygonConnectionStore, type PolygonEventBroker} from "./polygons/events";
import {initServerPubSub, registerServerPubSubHandlers} from "./polygons/server-events/shared/init-server-pub-sub";

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

export async function createApp(options: AppOptions = {}) {
  const connections: PolygonConnectionStore = new PolygonConnectionStore();
  const eventBroker: PolygonEventBroker = new ConnectionBackedPolygonEventBroker(connections);
  await initServerPubSub();
  registerServerPubSubHandlers(eventBroker);

  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.clientUrls.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(
          new Error(`CORS blocked origin: ${origin}`),
        );
      },
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
      connections,
      eventBroker,
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

export default createApp;
