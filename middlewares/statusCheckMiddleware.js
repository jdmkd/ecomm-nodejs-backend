const User = require('../model/userModel');


module.exports = function (req, res, next) {
    const user = req.user;
  
    if (user.status === 'blocked' || user.status === 'banned') {
      return res.status(403).json({ message: 'Access denied. Your account is restricted.' });
    }
  
    next();
  };