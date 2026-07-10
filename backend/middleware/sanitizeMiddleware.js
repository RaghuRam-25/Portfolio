const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeValue(nested)]));
  }

  return value;
};

const sanitizeRequest = (req, _res, next) => {
  if (req.body && Object.keys(req.body).length) {
    const sanitizedBody = sanitizeValue(req.body);
    Object.keys(req.body).forEach((key) => delete req.body[key]);
    Object.assign(req.body, sanitizedBody);
  }

  if (req.query && Object.keys(req.query).length) {
    const sanitizedQuery = sanitizeValue(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  next();
};

module.exports = sanitizeRequest;
