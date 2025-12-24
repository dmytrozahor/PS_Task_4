// Interface for custom class ApiError
export interface ApiError extends Error {
  success: boolean;
  message: string;
  statusCode: number;
  data: [] | {};
}

export interface ReviewsCount {
    id: number,
    counts: number
}