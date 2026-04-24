/**
 * Base application error class.
 * All custom errors extend this so the error middleware can distinguish
 * operational errors (expected, safe to expose) from programming errors.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Malformed request or business rule violation */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

/** 401 — Missing or invalid authentication */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

/** 403 — Authenticated but not allowed */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

/** 404 — Resource not found */
export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

/** 409 — Resource already exists or state conflict */
export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}
