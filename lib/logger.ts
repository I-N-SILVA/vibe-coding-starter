/* eslint-disable no-console */
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

/**
 * Optional error-reporting hook (e.g. Sentry). Registered at runtime from
 * `instrumentation.ts` so the logger has no build-time dependency on any
 * monitoring SDK — `log.error` forwards here when a reporter is present.
 * See docs/observability.md for the Sentry wiring.
 */
type ErrorReporter = (message: string, meta?: Record<string, unknown>) => void;
declare global {
     
    var __plyazErrorReporter: ErrorReporter | undefined;
}

function reportError(message: string, meta?: Record<string, unknown>) {
    try {
        globalThis.__plyazErrorReporter?.(message, meta);
    } catch {
        // never let error reporting throw inside the logger
    }
}

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
        const fn =
            level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(`${prefix} ${message}${metaStr}`);
    } else {
        // Structured JSON for production log aggregators
        const fn =
            level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(JSON.stringify(entry));
    }

    // Forward errors to the registered monitoring reporter (Sentry, etc.), if any.
    if (level === 'error') {
        reportError(message, meta);
    }
}

export const log = {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};
