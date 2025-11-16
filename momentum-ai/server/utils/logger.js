const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  return log;
});

// Detect serverless environment (e.g., Vercel or AWS Lambda)
const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION;

// Base logger instance
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'momentum-ai' },
  transports: [],
  exceptionHandlers: [],
  rejectionHandlers: []
});

// Console transport is always enabled
logger.add(new transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  )
}));

// Add file transports only when not running in serverless
if (!isServerless) {
  logger.add(new transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  logger.add(new transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));

  // Exception/rejection handlers to files in non-serverless environments
  logger.exceptions.handle(
    new transports.File({ filename: path.join('logs', 'exceptions.log') })
  );
  logger.rejections.handle(
    new transports.File({ filename: path.join('logs', 'rejections.log') })
  );
}

// Create a stream object with a 'write' function for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    }, 'Request completed');
  });
  
  next();
};

// Error logging middleware
logger.errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress
  });
  
  next(err);
};

module.exports = logger;
