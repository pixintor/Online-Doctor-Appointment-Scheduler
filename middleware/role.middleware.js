import AppError from "../utills/AppError.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("User not authenticated.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action.", 403),
      );
    }

    next();
  };
};

export default authorize;
