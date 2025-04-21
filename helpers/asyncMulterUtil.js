module.exports = function asyncMulter(multerFieldsMiddleware) {
    return (req, res, next) => {
      multerFieldsMiddleware(req, res, (err) => {
        if (err) {
          return next(err); // forwards to global error handler
        }
        next(); // all good
      });
    };
};
  