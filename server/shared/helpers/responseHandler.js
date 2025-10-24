/**
 /**
 * Helper to standardize backend responses
 * Used by ALL team */

/**
 * Send successful response
 * @param {Object} res - Express Response object
 * @param {*} data - Data to send (can be object, array, etc)
 * @param {String} message - Optional message
 * @param {Number} statusCode - HTTP Code (default 200)
 */
const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

/**
 * Send error response
 * @param {Object} res - Express Response object
 * @param {String|Error} error - Error message or Error object
 * @param {Number} statusCode - HTTP Code (default 500)
 */
const sendError = (res, error, statusCode = 500) => {
  // If it's an Error object, extract the message
  const errorMessage = error instanceof Error ? error.message : error
  
  console.error('API Error:', errorMessage)
  
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  })
}

/**
 * Send validation errors response
 * @param {Object} res - Express Response object
 * @param {Array} errors - Array of express-validator errors
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation errors',
    details: errors.array ? errors.array() : errors,
    timestamp: new Date().toISOString()
  })
}

/**
 * Send paginated response
 * @param {Object} res - Response object
 * @param {Array} data - Paginated data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 */
const sendPaginated = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendPaginated
}
