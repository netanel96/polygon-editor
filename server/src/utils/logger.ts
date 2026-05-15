import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';

import { config } from '../config';

type LogLevel = 'info' | 'error';

type LogDetails = Record<string, unknown>;

const LOG_OUTPUT = config.logOutput
    .split(',')
    .map(output => output.trim().toLowerCase())
    .filter(Boolean);

function serialize(value: unknown) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}

function formatValue(value: unknown) {
  const serialized = serialize(value);

  if (serialized === undefined) {
    return undefined;
  }

  if (
      typeof serialized === 'string' ||
      typeof serialized === 'number' ||
      typeof serialized === 'boolean'
  ) {
    return String(serialized);
  }

  return JSON.stringify(serialized);
}

function formatDetails(details: LogDetails) {
  return Object.entries(details)
      .map(([key, value]) => {
        const formattedValue = formatValue(value);

        if (formattedValue === undefined) {
          return undefined;
        }

        return `${key}=${formattedValue}`;
      })
      .filter(Boolean)
      .join(' ');
}

function formatLog(
    level: LogLevel,
    message: string,
    details: LogDetails = {},
) {
  const detailsText = formatDetails({
    transport: config.logTransport,
    ...details,
  });

  return [
    new Date().toISOString(),
    level.toUpperCase().padEnd(5),
    message,
    detailsText,
  ]
      .filter(Boolean)
      .join(' ');
}

function writeToFile(line: string) {
  const logDirectory = path.dirname(config.logFilePath);

  fs.mkdirSync(logDirectory, {
    recursive: true,
  });

  fs.appendFileSync(config.logFilePath, `${line}\n`);
}

function writeLog(
    level: LogLevel,
    message: string,
    details?: LogDetails,
) {
  const line = formatLog(level, message, details);

  if (LOG_OUTPUT.includes('file')) {
    writeToFile(line);
  }

  if (LOG_OUTPUT.includes('console')) {
    const output =
        level === 'error' ? console.error : console.log;

    output(line);
  }
}

export const logger = {
  info(message: string, details?: LogDetails) {
    writeLog('info', message, details);
  },

  error(message: string, details?: LogDetails) {
    writeLog('error', message, details);
  },

  childError(error: unknown) {
    return util.inspect(serialize(error), {
      depth: null,
    });
  },
};
