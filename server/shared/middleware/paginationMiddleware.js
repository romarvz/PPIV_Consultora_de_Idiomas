/**
 * Pagination middleware
 * Extracts and validates pagination parameters from query string
 * 
 * Usage:
 * router.get('/items', paginationMiddleware, controller.getAll)
 * 
 * Expected query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 10, max: 100)
 * 
 * Adds to req.pagination:
 * - page, limit, skip
 */

const paginationMiddleware = (req, res, next) => {
  // Extract from query params
  const page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || 10
  
  // Validations
  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page number must be greater than 0'
    })
  }
  
  // Limit maximum items per page
  if (limit > 100) {
    limit = 100
  }
  
  if (limit < 1) {
    limit = 10
  }
  
  // Calculate skip for MongoDB
  const skip = (page - 1) * limit
  
  // Add to request for controller use
  req.pagination = {
    page,
    limit,
    skip
  }
  
  next()
}

module.exports = paginationMiddleware
