class ApiError extends Error {
  statusCode: number;
  details: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.stack = new Error().stack;
  }

  static badRequest(message: string, details: any = null): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string, details: any = null): ApiError {
    return new ApiError(401, message, details);
  }

  static forbidden(message: string, details: any = null): ApiError {
    return new ApiError(403, message, details);
  }

  static notFound(message: string, details: any = null): ApiError {
    return new ApiError(404, message, details);
  }

  static conflict(message: string, details: any = null): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message: string, details: any = null): ApiError {
    return new ApiError(500, message, details);
  }
}

export default ApiError;
