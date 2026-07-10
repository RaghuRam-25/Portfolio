const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    const status = res.statusCode;
    const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${status} ${duration}ms`;
    if (status >= 500) console.error(line);
    else console.log(line);
  });
  next();
};

module.exports = requestLogger;
