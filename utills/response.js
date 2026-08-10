exports.successResponse = (
  res,
  statusCode = 200,
  message = "Request successful",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (
  res,
  statusCode = 500,
  message = "Something went wrong",
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

exports.paginatedResponse = (
  res,
  statusCode = 200,
  message = "Records retrieved successfully",
  data = [],
  pagination = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};

exports.createdResponse = (
  res,
  message = "Resource created successfully",
  data = null
) => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

exports.noContentResponse = (
  res,
  message = "Operation completed successfully"
) => {
  return res.status(200).json({
    success: true,
    message
  });
};

exports.validationErrorResponse = (
  res,
  errors
) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors
  });
};

exports.notFoundResponse = (
  res,
  message = "Resource not found"
) => {
  return res.status(404).json({
    success: false,
    message
  });
};

exports.unauthorizedResponse = (
  res,
  message = "Authentication required"
) => {
  return res.status(401).json({
    success: false,
    message
  });
};

exports.forbiddenResponse = (
  res,
  message = "You do not have permission to perform this action"
) => {
  return res.status(403).json({
    success: false,
    message
  });
};

