export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "DatabaseError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}