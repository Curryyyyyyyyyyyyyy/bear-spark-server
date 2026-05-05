import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './utils/helper.js';
import { registerRoutes } from './router/index.js';
import { requestLogger, cors } from './middleware/index.js';
import { initDatabase } from './database/connection.js';

const app = new Koa();

// Middleware
app.use(errorHandler);
app.use(cors);
app.use(requestLogger);
app.use(bodyParser());

// Routes
registerRoutes(app);

// Initialize database and start server
async function start() {
  try {
    await initDatabase();

    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
      logger.info(`📦 Environment: ${config.NODE_ENV}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
