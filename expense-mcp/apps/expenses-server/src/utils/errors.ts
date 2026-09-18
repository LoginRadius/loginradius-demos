export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details?: Record<string, unknown>) {
        super(401, 'UNAUTHORIZED', message, details);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details?: Record<string, unknown>) {
        super(403, 'FORBIDDEN', message, details);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(404, 'RESOURCE_NOT_FOUND', message, { resource, id });
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(400, 'VALIDATION_ERROR', message, details);
        this.name = 'ValidationError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(409, 'CONFLICT', message, details);
        this.name = 'ConflictError';
    }
}

