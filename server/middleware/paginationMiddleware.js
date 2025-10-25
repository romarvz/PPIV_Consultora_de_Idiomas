// shared/middleware/paginationMiddleware.js (temporal)
exports.paginationMiddleware = (req, res, next) => {
  req.pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    skip: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 10)
  };
  next();
};