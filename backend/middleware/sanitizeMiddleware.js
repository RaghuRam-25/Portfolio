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

  // Express 5-এ req.query একটি getter (প্রতিবার re-parse হয়), তাই delete/Object.assign
  // কোনো প্রভাব ফেলে না। সেনিটাইজ করা কুয়েরি আলাদা প্রপার্টিতে রাখা হয় (M1 fix)।
  if (req.query && Object.keys(req.query).length) {
    req.sanitizedQuery = sanitizeValue(req.query);
  }

  next();
};

module.exports = sanitizeRequest;
