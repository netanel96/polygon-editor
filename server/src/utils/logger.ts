import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';

import pino, { type LoggerOptions, type StreamEntry } from 'pino';

import { config } from '../config';

type LogDetails = Record<string, unknown>;

const LOG_OUTPUT = config.logOutput
  .split(',')
  .map(output => output.trim().toLowerCase())
  .filter(Boolean);

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function createLogStreams(): StreamEntry[] {
  const streams: StreamEntry[] = [];

  if (LOG_OUTPUT.includes('console')) {
    streams.push({
      stream: pino.destination({
        dest: 1,
        sync: false,
      }),
    });
  }

  if (LOG_OUTPUT.includes('file')) {
    fs.mkdirSync(path.dirname(config.logFilePath), {
      recursive: true,
    });

    streams.push({
      stream: pino.destination({
        dest: config.logFilePath,
        sync: false,
      }),
    });
  }

  return streams;
}

const loggerOptions: LoggerOptions = {
  base: {
    transport: config.logTransport,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const pinoLogger = pino(
  loggerOptions,
  pino.multistream(createLogStreams()),
);

export const logger = {
  info(message: string, details: LogDetails = {}) {
    pinoLogger.info(details, message);
  },

  error(message: string, details: LogDetails = {}) {
    pinoLogger.error(details, message);
  },

  childError(error: unknown) {
    return util.inspect(serializeError(error), {
      depth: null,
    });
  },
};
