export class ErrorHandler extends Error {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;

        this.name = 'ErrorHandler';

    
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
