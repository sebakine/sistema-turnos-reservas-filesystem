/**
 * Errores de dominio compartidos por los managers.
 * Los routers los traducen al código HTTP correspondiente.
 */

/** Datos inválidos o incompletos -> HTTP 400 */
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

/** Recurso inexistente -> HTTP 404 */
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}
