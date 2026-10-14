import type { Instrumentation } from 'next';
import { logError } from '@/lib/logger';

export function register() {}

// Captures errors that escape route handlers, server components and middleware.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  await logError('request.unhandled', err, {
    method: request.method,
    path: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
