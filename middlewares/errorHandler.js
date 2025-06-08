const errorHandler = (err, req, res, next) => {
  res
    .status(500)
    .json({
      success: false,
      message: err.message || "Server Error",
      data: null,
    });
};

module.exports = errorHandler;
