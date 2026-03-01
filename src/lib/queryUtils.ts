/**
 * Builds a query string from pagination, search, and filter parameters
 */
export const buildQueryString = (
  pageNum?: number,
  limitNum?: number | string,
  searchQuery?: string,
  filters?: Record<string, unknown>
): string => {
  // Build search query from filters and original search
  let combinedSearchQuery = searchQuery || '';

  if (filters) {
    const firstFilterValue = Object.values(filters)[0];
    if (Array.isArray(firstFilterValue) && firstFilterValue.length > 0) {
      combinedSearchQuery = firstFilterValue[0];
    }
  }

  const search = combinedSearchQuery ? `&search=${combinedSearchQuery}` : '';
  const pageParam = pageNum !== undefined ? `page=${pageNum}` : '';
  const limitParam = limitNum !== undefined ? `&limit=${limitNum}` : '';

  const queryString = pageParam || limitParam || search
    ? `?${pageParam}${limitParam}${search}`
    : '';

  return queryString;
};

/**
 * Concatenate params helper
 */
export const combineMultipleParams = (params: Record<string, string | number | boolean>) => {
  const queryPairs = Object.keys(params)
    .filter((key) => {
      const value = params[key];
      return value !== undefined && value !== null && value.toString().trim() !== '';
    })
    .map((key) => {
      const value = params[key];
      return `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`;
    });

  return queryPairs.length > 0 ? `?${queryPairs.join('&')}` : '';
};