const buildPagination = async (model, filter, query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(filter);

  return {
    page,
    limit,
    skip,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

const searchRegex = (value) => new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const buildTextSearch = (query, fields = []) => {
  if (!query.search || fields.length === 0) return {};
  const regex = searchRegex(query.search);
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

const parseSort = (query, fallback = '-createdAt') => {
  if (!query.sort) return fallback;
  return String(query.sort).split(',').join(' ');
};

module.exports = { buildPagination, buildTextSearch, parseSort };
