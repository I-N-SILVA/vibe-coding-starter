/**
 * Structured Logger - PLYAZ League Manager
 * JSON output in production, formatted in development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
    };

    if (isDev) {
        const prefix = `[${level.toUpperCase()}]`;
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(`${prefix} ${message}${metaStr}`);
    } else {
        // Structured JSON for production log aggregators
        const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(JSON.stringify(entry));
    }
}

export const log = {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
