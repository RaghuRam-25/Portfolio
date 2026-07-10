const ok = (res, data = null, message = 'OK', statusCode = 200, meta = undefined) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const created = (res, data, message = 'Created') => ok(res, data, message, 201);

module.exports = { ok, created };
