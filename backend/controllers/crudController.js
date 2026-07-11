const asyncHandler = require('../utils/asyncHandler');
const { buildPagination, buildTextSearch, parseSort } = require('../utils/apiFeatures');
const { ok, created } = require('../utils/responses');

const notDeleted = { deletedAt: null };

const makeCrudController = ({
  model,
  name,
  searchFields = [],
  populate = '',
  publicFilter = {},
  beforeCreate,
  beforeUpdate,
}) => {
  const list = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'admin';
    const baseFilter = isAdmin ? notDeleted : { ...notDeleted, ...publicFilter };
    const filter = { ...baseFilter, ...buildTextSearch(req.query, searchFields) };

    for (const [key, value] of Object.entries(req.query)) {
      if (['page', 'limit', 'search', 'sort'].includes(key) || value === undefined || value === '') continue;
      if (key in model.schema.paths) filter[key] = value;
    }

    // H3 fix: query params যেন publicFilter ওভাররাইড করতে না পারে —
    // non-admin হলে লুপের পরে publicFilter আবার প্রয়োগ করা হয়।
    if (!isAdmin) Object.assign(filter, publicFilter);

    const pagination = await buildPagination(model, filter, req.query);
    const rows = await model.find(filter)
      .populate(populate)
      .sort(parseSort(req.query))
      .skip(pagination.skip)
      .limit(pagination.limit);

    ok(res, rows, `${name} list`, 200, {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    // H2 fix: non-admin-দের জন্য publicFilter প্রয়োগ করা হয়,
    // যাতে ড্রাফট/unpublished কন্টেন্ট আইডি দিয়ে পড়া না যায়।
    const extra = req.user?.role === 'admin' ? {} : publicFilter;
    const row = await model.findOne({ _id: req.params.id, deletedAt: null, ...extra }).populate(populate);
    if (!row) return res.status(404).json({ success: false, message: `${name} not found` });
    ok(res, row, `${name} detail`);
  });

  const create = asyncHandler(async (req, res) => {
    const payload = beforeCreate ? await beforeCreate(req.body, req) : req.body;
    const row = await model.create(payload);
    created(res, row, `${name} created`);
  });

  const update = asyncHandler(async (req, res) => {
    const payload = beforeUpdate ? await beforeUpdate(req.body, req) : req.body;
    const row = await model.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    ).populate(populate);
    if (!row) return res.status(404).json({ success: false, message: `${name} not found` });
    ok(res, row, `${name} updated`);
  });

  const remove = asyncHandler(async (req, res) => {
    const row = await model.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!row) return res.status(404).json({ success: false, message: `${name} not found` });
    ok(res, null, `${name} deleted`);
  });

  return { list, getOne, create, update, remove };
};

module.exports = makeCrudController;
