/**
 * Parse ?page= & ?limit= query params into pagination options.
 */
export const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a standard paginated response envelope.
 */
export const buildPaginatedResponse = (items, total, page, limit) => ({
  success: true,
  data: items,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  },
});
