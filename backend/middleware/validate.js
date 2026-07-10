const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (source === 'body') {
    req.body = result.data;
  } else {
    Object.keys(req[source]).forEach((key) => delete req[source][key]);
    Object.assign(req[source], result.data);
  }

  next();
};

module.exports = validate;
