import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Errors are written to server/logs/errors.log (JSON lines, one entry per line)
const LOG_DIR = path.join(__dirname, '../../logs')
const ERROR_LOG = path.join(LOG_DIR, 'errors.log')

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

/**
 * Log an error to the error log file and to stderr.
 * @param {Error} err - The error to log
 * @param {Object} [context] - Optional context (e.g. { method, path, ... })
 */
export function logError(err, context = {}) {
  ensureLogDir()
  const timestamp = new Date().toISOString()
  const entry = {
    timestamp,
    message: err?.message ?? String(err),
    stack: err?.stack ?? undefined,
    ...context,
  }
  const line = JSON.stringify(entry) + '\n'
  fs.appendFileSync(ERROR_LOG, line)
  console.error(`[${timestamp}] ERROR:`, err?.message ?? err)
  if (err?.stack) console.error(err.stack)
}

export default { logError }
