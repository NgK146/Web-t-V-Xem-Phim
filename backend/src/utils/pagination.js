/**
 * Tính toán thông tin phân trang
 * @param {number|string} page
 * @param {number|string} limit
 * @param {number} total
 * @returns {{ skip: number, pagination: object }}
 */
export const buildPagination = (page, limit, total) => {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  return {
    skip: (p - 1) * l,
    pagination: {
      currentPage: p,
      totalPages: Math.ceil(total / l),
      totalItems: total,
      itemsPerPage: l,
    },
  };
};
