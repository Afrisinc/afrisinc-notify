export interface TokenPayload {
    username?: string
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'asc' | 'desc';
}