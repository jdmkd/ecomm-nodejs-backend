/**
 * Helper functions for standardizing API responses
 */

/**
 * Sends a success response
 * @param {object} res - Express response object {object}
 * @param {string} message - Success message {string}
 * @param {object|array|null} data - Response data {object|array|null}
 * @param {number} statusCode - HTTP status code (default: 200) {number}
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends an error response
 * @param {object} res - Express response object {object}
 * @param {string} message - Error message {string}
 * @param {number} statusCode - HTTP status code (default: 500) {number}
 */
const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

/**
 * Sends a validation error response
 * @param {object} res - Express response object {object}
 * @param {string} message - Validation error message {string}
 */
const sendValidationError = (res, message) => {
  return sendError(res, message, 400);
};

/**
 * Sends a not found error response
 * @param {object} res - Express response object {object}
 * @param {string} message - Not found error message {string}
 */
const sendNotFoundError = (res, message) => {
  return sendError(res, message, 404);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFoundError
}; 