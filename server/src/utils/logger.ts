import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';

type LogLevel = 'info' | 'error';

type LogDetails = Record<string, unknown>;

const LOG_FILE_PATH =
  process.env.LOG_FILE_PATH ?? 'logs/server.log';

const LOG_OUTPUT = (
  process.env.LOG_OUTPUT ?? 'console,file'
)
  .split(',')
  .map(output => output.trim().toLowerCase())
  .filter(Boolean);

const LOG_TRANSPORT =
  process.env.LOG_TRANSPORT ?? 'local';

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

function formatLog(
  level: LogLevel,
  message: string,
  details: LogDetails = {},
) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    transport: LOG_TRANSPORT,
    details: Object.fromEntries(
      Object.entries(details).map(([key, value]) => [
        key,
        serialize(value),
      ]),
    ),
  });
}

function writeToFile(line: string) {
  const logDirectory = path.dirname(LOG_FILE_PATH);

  fs.mkdirSync(logDirectory, {
    recursive: true,
  });

  fs.appendFileSync(LOG_FILE_PATH, `${line}\n`);
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
