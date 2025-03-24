import type { Response } from 'express';

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  pagination?: PaginationMetadata;
}

export class ApiResponse {
  /**
   * Create a standardized API response object
   * @param success Whether the request was successful
   * @param message Response message
   * @param data Optional response data
   * @param pagination Optional pagination information
   * @returns Standardized API response object
   */
  private static createResponseObject(
    success: boolean,
    message: string,
    data?: any,
    pagination?: PaginationMetadata
  ): ApiResponseData {
    return {
      success,
      message,
      data,
      pagination,
    };
  }

  /**
   * Send a response with the specified status code
   * @param res Express response object
   * @param statusCode HTTP status code
   * @param responseData API response data
   * @returns Express response
   */
  private static sendResponse(
    res: Response,
    statusCode: HttpStatusCode,
    responseData: ApiResponseData
  ): Response {
    return res.status(statusCode).json(responseData);
  }

  /**
   * Successful response (200 OK)
   * @param res Express response object
   * @param message Success message
   * @param data Optional response data
   * @param pagination Optional pagination information
   */
  static ok(
    res: Response,
    message: string = 'Success',
    data?: any,
    pagination?: PaginationMetadata
  ): Response {
    const responseData = this.createResponseObject(
      true,
      message,
      data,
      pagination
    );
    return this.sendResponse(res, HttpStatusCode.OK, responseData);
  }

  /**
   * Resource created successfully (201 Created)
   * @param res Express response object
   * @param message Creation success message
   * @param data Optional created resource data
   */
  static created(
    res: Response,
    message: string = 'Resource created successfully',
    data?: any
  ): Response {
    const responseData = this.createResponseObject(true, message, data);
    return this.sendResponse(res, HttpStatusCode.CREATED, responseData);
  }

  /**
   * Successful request with no content to return (204 No Content)
   * @param res Express response object
   * @param message Optional message
   */
  static noContent(res: Response, message: string = 'No content'): Response {
    const responseData = this.createResponseObject(true, message);
    return this.sendResponse(res, HttpStatusCode.NO_CONTENT, responseData);
  }

  /**
   * Bad request error (400 Bad Request)
   * @param res Express response object
   * @param message Error message
   * @param data Optional error details
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    data?: any
  ): Response {
    const responseData = this.createResponseObject(false, message, data);
    return this.sendResponse(res, HttpStatusCode.BAD_REQUEST, responseData);
  }

  /**
   * Unauthorized error (401 Unauthorized)
   * @param res Express response object
   * @param message Error message
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    const responseData = this.createResponseObject(false, message);
    return this.sendResponse(res, HttpStatusCode.UNAUTHORIZED, responseData);
  }

  /**
   * Forbidden error (403 Forbidden)
   * @param res Express response object
   * @param message Error message
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    const responseData = this.createResponseObject(false, message);
    return this.sendResponse(res, HttpStatusCode.FORBIDDEN, responseData);
  }

  /**
   * Not found error (404 Not Found)
   * @param res Express response object
   * @param message Error message
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    const responseData = this.createResponseObject(false, message);
    return this.sendResponse(res, HttpStatusCode.NOT_FOUND, responseData);
  }

  /**
   * Internal server error (500 Internal Server Error)
   * @param res Express response object
   * @param message Error message
   * @param data Optional error details
   */
  static internalServerError(
    res: Response,
    message: string = 'Internal server error',
    data?: any
  ): Response {
    const responseData = this.createResponseObject(false, message, data);
    return this.sendResponse(
      res,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      responseData
    );
  }

  /**
   * Create pagination metadata
   * @param totalItems Total number of items
   * @param currentPage Current page number
   * @param itemsPerPage Number of items per page
   * @returns Pagination metadata object
   */
  static createPagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginationMetadata {
    return {
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage,
      itemsPerPage,
    };
  }
}
