const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const toPositiveInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query) => {
    const page = toPositiveInteger(query.page, DEFAULT_PAGE);
    const requestedLimit = toPositiveInteger(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

const paginate = (rows, total, page, limit) => ({
    data: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit)
});

module.exports = { getPagination, paginate };
