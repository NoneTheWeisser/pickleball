/**
 * Log an error to the console and report it to the server for persistent logging.
 */
export function logError(err, context = {}) {
  const message = err?.message ?? String(err)
  const stack = err?.stack
  console.error(message, stack ?? '', context)
  fetch('/api/client-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      stack,
      context: { ...context, userAgent: navigator?.userAgent },
    }),
  }).catch(() => {}) // Don't let logging failures cause more errors
}
