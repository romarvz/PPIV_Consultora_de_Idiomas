/**
 * Centralized middleware
 */

const paginationMiddleware = require('./paginationMiddleware')
const errorHandler = require('./errorHandler')

module.exports = {
  paginationMiddleware,
  errorHandler
}