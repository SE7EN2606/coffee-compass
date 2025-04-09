// Utility functions for Netlify functions

/**
 * Helper function to handle errors in async functions
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
function asyncHandler(fn) {
  return function(req, res, next) {
    return Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

/**
 * Creates a response object in the format Netlify functions expect
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 * @returns {object} - Formatted response
 */
function createResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(data)
  };
}

/**
 * Log error details while hiding sensitive information
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
function logError(error, context) {
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}

module.exports = {
  asyncHandler,
  createResponse,
  logError
};